import '../css/main.scss'

const AppView = () => {
    document.body.innerHTML = `<h1>Simple Example</h1>
        <form action="javascript:savePhoto();">
            <fieldset>
                <label for="fileSelector">Select an Image file</label>
                <input type="file" id="fileSelector" />

                <div class="scale-container">
                    <input id="scaleVal" class="scale-input" onchange=onChangeScaleValue(this.value) type="number"
                         placeholder="Please enter your photo(s) scale.. " max="100"/>
                     <button id="scaleBtn" class="scale-btn" onclick="scalePhoto()" disabled>Scale Photo</button>
                </div>
            </fieldset>
            <input class="m-1" id="submit" type="submit" value="Submit">
        </form>

        <div id="canvas-container" class="d-none">
            <button title="Move to Left" onclick="moveTo()"></button>
            <canvas id="editorCanvas"></canvas>
            <button title="Move to Right" onclick="moveTo(true)"></button>
        </div>`;

    // grab DOM elements inside index.html
    const fileSelector = document.getElementById("fileSelector");
    const editorCanvas = document.getElementById("editorCanvas");

    window.addEventListener('DOMContentLoaded', (event) => {
        window.scaleButton = document.getElementById('scaleBtn');
    });

    window.fileUploaded = false;
    window.scaleValue = null;
    window.imgObj = null;
    window.scalePhoto = () => {
        if (!window.fileUploaded) {
            alert("Please select an image file..");
            return;
        }

        const scale = parseInt(window.scaleValue);
        if (scale > 100) {
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
    window.moveTo = (right) => {
        const elem = document.getElementById("canvas-container");
        const floatClassName = right ? "right" : "left";
        elem.className = `d-flex ${floatClassName}`;
    }
    window.onChangeScaleValue = function (val) {
        window.scaleValue = val;
        scaleButton.disabled = !val;
    }
    window.savePhoto =  () => {
        if (!window.fileUploaded) {
            alert("Please select an image file..");
            return;
        }
    }

    fileSelector.onchange = (e) => {
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

                            //visible canvas container..
                            document.getElementById("canvas-container").className = "d-flex";
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

