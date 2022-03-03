import '../css/main.scss'

const AppView = () => {
    document.body.innerHTML = `<h1>Simple Example</h1>
        <form action="#">
            <fieldset>
                <label for="fileSelector">Select an Image file</label>
                <input type="file" id="fileSelector" />
            </fieldset>
        </form>

        <div class="scale-container">
            <input id="scaleVal" class="scale-input" onchange=onChangeScaleValue(this.value) type="number"
                 placeholder="Please enter your photo(s) scale.. " max="100"/>
            <button id="scaleBtn" class="scale-btn" onclick="scalePhoto()" disabled>Scale Photo</button>
        </div>

        <canvas id="editorCanvas"></canvas>`;

    // grab DOM elements inside index.html
    const fileSelector = document.getElementById("fileSelector");
    const editorCanvas = document.getElementById("editorCanvas");

    window.addEventListener('DOMContentLoaded', (event) => {
        window.scaleButton = document.getElementById('scaleBtn');
    });

    window.fileUploaded = false;
    window.scaleValue = null;
    window.imgObj = null;
    window.scalePhoto = function () {
        if (!window.fileUploaded) {
            alert("Please select an image file..");
            return;
        }

        const scale = parseInt(window.scaleValue);
        if(scale > 100) {
            alert("Scale value cannot be greater than 100.");
            window.scaleValue = 100;
            document.getElementById("scaleVal").value = 100;
            return;
        }

        const scalePercentage = scale / 100;
        const ctx = editorCanvas.getContext('2d');
        const newWidth = window.imgObj.naturalWidth * scalePercentage;
        const newHeight = window.imgObj.naturalHeight * scalePercentage;
        editorCanvas.width = newWidth;
        editorCanvas.height = newHeight;
        ctx.drawImage(window.imgObj, 0, 0, newWidth, newHeight);
    }

    window.onChangeScaleValue = function (val) {
        window.scaleValue = val;
        scaleButton.disabled = !val;
    }

    fileSelector.onchange = function (e) {
        // get all selected Files
        const files = e.target.files;
        let file;
        for (let i = 0; i < files.length; ++i) {
            file = files[i];
            // check if file is valid Image (just a MIME check)
            switch (file.type) {
                case "image/jpeg":
                case "image/png":
                case "image/gif":
                    window.fileUploaded = true;
                    // read Image contents from file
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        // create HTMLImageElement holding image data
                        const img = new Image();
                        img.src = reader.result;

                        img.onload = function () {
                            // grab some data from the image
                            const width = img.naturalWidth;
                            const height = img.naturalHeight;
                            window.imgObj = img;

                            editorCanvas.width = 500;
                            editorCanvas.height = 500 * height / width;
                            const ctx = editorCanvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height, 0, 0, editorCanvas.width, editorCanvas.height);
                        }
                        // do your magic here...
                    };
                    reader.readAsDataURL(file);
                    // process just one file.
                    return;
                default:
                    alert("Some of your file(s) cannot process for now..");
            }
        }
    };
}

AppView();

