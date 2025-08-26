let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");
let image = document.querySelector("#image img");


const Api_Url = "/api/proxy";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    let parts = [{ "text": user.message }];
    if (user.file && user.file.data) {
        parts.push({ "inline_data": user.file });
    }

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": parts
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            let apiResponse = data.candidates[0].content.parts[0].text
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .trim();
            text.innerHTML = apiResponse;
        } else {
            text.innerHTML = "⚠️ No response from API.";
            console.log("API Raw Response:", data);
        }
    }
    catch (error) {
        console.log("API Error:", error);
        text.innerHTML = "⚠️ Error fetching response.";
    }
    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `./assets/img.svg`;
        image.classList.remove("choose");
        user.file = { mime_type: null, data: null };
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes, "chat-row");
    return div;
}

function handlechatResponse(usermessage) {
    if (!usermessage.trim() && !user.file.data) return; // prevent empty messages

    user.message = usermessage;
    let html = `
        <img src="./assets/user2.png" alt="User" class="chat-avatar" id="userImage">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>`;
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <img src="./assets/chat.webp" alt="AI" class="chat-avatar" id="aiImage">
            <div class="ai-chat-area">
                <img src="./assets/load.webp" alt="loading..." class="load" width="40px">
            </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

/* --- Input Handling --- */
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === "ArrowUp") {
        e.preventDefault(); // prevent line breaks
        handlechatResponse(prompt.value);
    }
});

document.querySelector("#submit").addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

/* --- Image Upload --- */
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});
