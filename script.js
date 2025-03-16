const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const GenarateBtn = document.querySelector(".generate-btn");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".propt-input");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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";

const bannedWords = [
    "nude", "naked", "porn", "pornography", "erotic", "explicit", "NSFW", "18+", "xxx", "sex", "sexual", "fetish", "BDSM", "kink", "seduction", "strip", "stripping", "lingerie", "topless", "bottomless", "adult content",
    "breasts", "boobs", "nipples", "areola", "vagina", "clitoris", "penis", "testicles", "genitals", "crotch", "anus", "butt", "booty", "ass", "cleavage", "thong", "cameltoe",
    "intercourse", "blowjob", "handjob", "oral sex", "anal sex", "masturbation", "foreplay", "moaning", "cum", "ejaculation", "wet dream", "orgasm",
    "sexy pose", "seductive", "erotic dance", "sensual", "hot girl", "hot guy", "barely dressed", "see-through", "wet shirt", "dominatrix", "submissive", "slave", "roleplay", "cosplay",
    "underage", "lolita", "rape", "abuse", "forced", "non-consensual", "bestiality", "necrophilia", "snuff", "gore"
];

const isPromptSafe = (prompt) => {
    return !bannedWords.some((word) => prompt.toLowerCase().includes(word));
};

const examplesPrompr = [
    "A futuristic cityscape at sunset with flying cars and neon lights",
    "A mystical forest with glowing mushrooms and magical creatures",
    "A cyberpunk samurai standing on a rainy rooftop, overlooking a neon-lit city",
    "A steampunk airship flying through the clouds above a Victorian-era city",
    "An astronaut exploring an alien planet with strange plants and creatures",
    "A medieval castle on top of a mountain surrounded by fog and dragons",
    "A warrior with glowing eyes holding a magical sword in an enchanted battlefield",
    "A post-apocalyptic wasteland with abandoned buildings and overgrown vegetation",
    "A robotic humanoid with intricate metallic details, standing in a high-tech lab",
    "A fantasy village with tiny houses built inside giant mushrooms",
    "A sci-fi battle scene between advanced humanoid robots in deep space",
    "A mysterious cave with a glowing crystal at its center, illuminating the darkness",
    "A cosmic nebula with vibrant swirling colors and distant planets",
    "A grand underwater city with mermaids, glowing corals, and futuristic submarines",
    "A haunted mansion on a stormy night with eerie lights and ghostly apparitions",
    "A Viking warrior standing on a snowy battlefield, holding a massive axe",
    "A serene Japanese garden with cherry blossoms falling gently into a koi pond",
    "A mystical dragon with iridescent scales flying over an ancient temple",
    "A retro-futuristic 1980s-inspired cyber grid with neon synthwave colors",
    "A surreal dreamlike landscape with floating islands and a giant moon in the sky"
];

(() => {
    const saveTheme = localStorage.getItem("theme");
    const sysytemPreferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkTheme = saveTheme === "dark" || (!saveTheme && sysytemPreferDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);
    return { 
        width: Math.floor((width * scaleFactor) / 16) * 16, 
        height: Math.floor((height * scaleFactor) / 16) * 16 
    };
};

const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if (!imgCard) return;
    imgCard.classList.remove("loading");
    imgCard.innerHTML = `  <img src="${imgUrl}" class="result-img">
                            <div class="img-overlay">
                                <a href="${imgUrl}" class="img-downlode-btn" download="${Date.now()}.png">
                                    <i class="fa-solid fa-download"></i>
                                </a>
                            </div>`;
};

const generateImages = async (slectModel, imageCount, aspectRatio, promptText) => {
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${slectModel}`;
    const { width, height } = getImageDimensions(aspectRatio);
    GenarateBtn.setAttribute("disabled", "true");

    const imagesPromises = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false },
                }),
            });
            if (!response.ok) throw new Error((await response.json())?.error);
            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
        } catch (error) {
            console.error(error);
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.classList.replace("loading", "error");
            imgCard.querySelector(".status-text").textContent = "Generation Failed....!  Check Console FOr More INfo:)"
        }
    });
    GenarateBtn.removeAttribute("disabled");
    await Promise.allSettled(imagesPromises);
};

const createImageCards = (slectModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";
    for (let i = 0; i < imageCount; i++) {
        gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                    </div>`;
    }
    generateImages(slectModel, imageCount, aspectRatio, promptText);
};

const handelFormSubmit = (e) => {
    e.preventDefault();
    const slectModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

    if (!isPromptSafe(promptText)) {
        alert("Your prompt contains inappropriate content. Please enter a different prompt.");
        return;
    }

    createImageCards(slectModel, imageCount, aspectRatio, promptText);
};

promptBtn.addEventListener("click", () => {
    const prompt = examplesPrompr[Math.floor(Math.random() * examplesPrompr.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

promptForm.addEventListener("submit", handelFormSubmit);
themeToggle.addEventListener("click", toggleTheme);
