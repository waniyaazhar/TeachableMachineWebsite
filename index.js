
// Paste your Teachable Machine model link here
const URL = "YOUR_MODEL_LINK_HERE";

let model, webcam, labelContainer, maxPredictions;

async function init() {

    const startButton = document.getElementById("start-btn");

    try {
        startButton.disabled = true;
        startButton.innerText = "Loading Model...";

        // Load trained model
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        maxPredictions = model.getTotalClasses();

        // Start webcam
        webcam = new tmImage.Webcam(300, 300, true);

        await webcam.setup();
        await webcam.play();

        document.getElementById("webcam-container")
            .innerHTML = "";

        document.getElementById("webcam-container")
            .appendChild(webcam.canvas);

        // Create prediction result areas
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";

        for (let i = 0; i < maxPredictions; i++) {

            const div = document.createElement("div");

            div.className = "prediction";

            div.innerHTML = `
                <p id="label-${i}"></p>
                <div class="progress-bar">
                    <div class="progress" id="bar-${i}"></div>
                </div>
            `;

            labelContainer.appendChild(div);
        }

        document.getElementById("result").innerText =
            "Camera started! Show an object to classify.";

        startButton.innerText = "Camera Running";

        window.requestAnimationFrame(loop);

    } catch (error) {

        console.error(error);

        document.getElementById("result").innerText =
            "Error: " + error.message;

        startButton.disabled = false;
        startButton.innerText = "Try Again";
    }
}


// Continuously update webcam and predictions
async function loop() {

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);
}


// Make predictions using trained model
async function predict() {

    const prediction = await model.predict(webcam.canvas);

    let highestPrediction = prediction[0];

    for (let i = 0; i < maxPredictions; i++) {

        const className = prediction[i].className;
        const probability = prediction[i].probability;

        const percentage = (probability * 100).toFixed(2);

        document.getElementById(`label-${i}`).innerText =
            className + ": " + percentage + "%";

        document.getElementById(`bar-${i}`).style.width =
            percentage + "%";

        if (probability > highestPrediction.probability) {
            highestPrediction = prediction[i];
        }
    }

    document.getElementById("result").innerText =
        "Detected: " + highestPrediction.className +
        " (" + (highestPrediction.probability * 100).toFixed(2) + "%)";
}
