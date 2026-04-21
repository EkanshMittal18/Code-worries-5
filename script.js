let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");
let submitButton = document.querySelector("#submit");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB8S2yxtstikaOBVoWh2qlAmNaAFIVYvLM";
let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

// Random user images
const userImage = "https://randomuser.me/api/portraits/men/10.jpg"; // Replace with any random image URL
const aiImage = "https://randomuser.me/api/portraits/men/1.jpg"; // Replace with any random image URL

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        { "text": user.message },
                        (user.file.data ? [{ "inline_data": user.file }] : [])
                    ]
                }
            ]
        })
    };
    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\\(.?) \\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    }
    catch (error) {
        console.log(error);
    }
    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = "imageicon.svg";
        image.classList.remove("choose");
        user.file = {};
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handleChatResponse(userMessage) {
    user.message = userMessage;
    let html = `
        <div class="user-chat-box">
            <img src="${userImage}" alt="User" class="user-avatar" width="40">
            <div class="user-chat-area">
                ${user.message}
                ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseing" />` : ""}
            </div>
        </div>`;
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <div class="ai-chat-box">
                <img src="${aiImage}" alt="AI" class="ai-avatar" width="40">
                <div class="ai-chat-area">
                    <img src="dots.svg" alt="" class="load" width="50px">
                </div>
            </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 100);
}

// Triggering handleChatResponse when user presses Enter key
prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handleChatResponse(prompt.value);
    }
});

// Handling Submit button click
submitButton.addEventListener("click", () => {
    if (prompt.value.trim() !== "") {
        handleChatResponse(prompt.value);
    }
});

// Handling File Upload
imagebtn.addEventListener("click", () => {
    imageinput.click(); // This triggers the file input
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0]; // Get the selected file
    if (!file) return; // If no file is selected, return early

    // Creating a FileReader to read the file and convert it to base64
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1]; // Extract base64 data from the result
        user.file = {
            mime_type: file.type,
            data: base64string
        };

        // Displaying the uploaded image as a preview
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };

    reader.readAsDataURL(file); // Read the file as a data URL (base64)
});
