import '../css/main.scss'

const AppView = () => {
    document.body.innerHTML = `<h1>Simple Example</h1>
        <form action="javascript:savePhoto();">
            <fieldset>
                <div class="d-flex">
                    <div>
                        <label for="fileSelector">Select an Image file</label>
                        <input type="file" id="fileSelector" />
                    </div>
                    <div class="mx-2">|</div>
                    <div>
                        <label>Import an Image file</label>
                        <select id="importList" onchange="onChangeImage(this)">
                        </select>
                    </div>
                </div>

                <div class="scale-container">
                    <input id="scaleVal" class="scale-input" onchange="onChangeScaleValue(this.value)" type="number"
                         placeholder="Please enter your photo(s) scale.. " max="100"/>
                     <button id="scaleBtn" class="scale-btn" onclick="scalePhoto(event)" disabled>Scale Photo</button>
                </div>
            </fieldset>
            <input class="m-1" id="submit" type="submit" value="Submit">
        </form>

        <div id="canvas-container" class="d-none">
            <button title="Drag to Left" onclick="dragTo()"></button>
            <canvas id="editorCanvas"></canvas>
            <button title="Drag to Right" onclick="dragTo(true)"></button>
        </div>`;

    // grab DOM elements inside index.html
    const fileSelector = document.getElementById("fileSelector");
    const editorCanvas = document.getElementById("editorCanvas");

    window.addEventListener('DOMContentLoaded', (event) => {
        window.scaleButton = document.getElementById('scaleBtn');
        window.prepareSelectBox();
    });

    window.fileUploaded = false;
    window.scaleValue = null;
    window.imgObj = null;
    window.scalePhoto = (e) => {
        e.preventDefault();
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

        const scalePercentage = scale / 100; // percentage of scale
        const newWidth = window.imgObj.naturalWidth * scalePercentage;
        const newHeight = window.imgObj.naturalHeight * scalePercentage;
        window.renderImage(window.imgObj, newWidth, newHeight);
    }
    window.renderImage = (img, newWidth, newHeight) => {
        const ctx = editorCanvas.getContext('2d');
        editorCanvas.width = newWidth;
        editorCanvas.height = newHeight;
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,     // source rectangle
            0, 0, editorCanvas.width, editorCanvas.height); // destination rectangle
    }
    window.dragTo = (right) => {
        const elem = document.getElementById("canvas-container");
        let left = right ? elem.offsetLeft + 100 : elem.offsetLeft - 100;
        left = left < 0 ? 0 : left;
        elem.style.left = `${left}px`;
    }
    window.onChangeScaleValue = function (val) {
        window.scaleValue = val;
        scaleButton.disabled = !val;
    }
    window.savePhoto = () => {
        if (!window.fileUploaded) {
            alert("Please select an image file..");
            return;
        }

        let storedImages = getStoredImages();
        const data = {
            "canvas": {
                "width": editorCanvas.width,
                "height": editorCanvas.height,
                "photo": {
                    "id": window.imgObj.name,
                    "x": window.scrollX + document.querySelector('#editorCanvas').getBoundingClientRect().left, // X,
                    "y": window.scrollY + document.querySelector('#editorCanvas').getBoundingClientRect().top, // Y
                    "src": window.imgObj.src
                }
            }
        };
        storedImages[window.imgObj.name] = data;
        window.localStorage.setItem("imgData", JSON.stringify(storedImages));
        window.prepareSelectBox();
    }
    window.prepareSelectBox = () => {
        const selectElem = document.getElementById("importList");
        selectElem.replaceChildren();
        const images = getStoredImages();
        window.createOption("Select an image..", selectElem, "default");
        for (const val in images) {
            window.createOption(val, selectElem);
        }
    }
    window.createOption = (optionValue, selectContainer) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.text = optionValue;
        selectContainer.appendChild(option);
    }
    window.onChangeImage = (selectedImg) => {
        const key = selectedImg.value;
        if (key === "Select an image..") {
            window.changeCanvasVisible(false);
            return;
        }
        const images = getStoredImages();
        const currentImg = images[key];
        const image = new Image();
        image.src = currentImg.canvas.photo.src;
        window.imgObj = image;
        window.imgObj.name = key;
        image.onload = () => {
            window.fileUploaded = true;
            window.renderImage(image, currentImg.canvas.width, currentImg.canvas.height);
            window.changeCanvasCoordinates(currentImg.canvas.photo.x, currentImg.canvas.photo.y);
            window.changeCanvasVisible();
        }
    }
    window.changeCanvasCoordinates = (left, top) => {
        const elem = document.getElementById("canvas-container");
        elem.style.left = `${left}px`;
        elem.style.top = `${top}px`;
    }

    window.getStoredImages = () => {
        let storedImages = JSON.parse(window.localStorage.getItem("imgData"));
        if (!storedImages) {
            storedImages = {};
        }
        return storedImages;
    }

    window.changeCanvasVisible = (visible = true) => {
        //visible canvas container..
        document.getElementById("canvas-container").className = visible ? "d-flex" : "d-none";
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
                            window.imgObj.name = file.name;

                            editorCanvas.width = 500;
                            editorCanvas.height = 500 * height / width;
                            const ctx = editorCanvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height, 0, 0, editorCanvas.width, editorCanvas.height);

                            window.changeCanvasVisible();
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

