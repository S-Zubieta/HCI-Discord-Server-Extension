/**
 * @name ServerBranch
 * @author YourName
 * @description Adds a "Click Me" button under the Friends/Nitro/etc. buttons
 * @version 0.3.0
 */

module.exports = class ServerBranch {
    constructor(meta) {
        this.meta = meta;
        this.myButton = null;
        this.interval = null;
    }

    start() {
        console.log("🚀 ServerBranch started");

        // Create button
        const myButton = document.createElement("button");
        myButton.textContent = "Click Me";
        myButton.className = "serverBranch-btn";
        Object.assign(myButton.style, {
            display: "block",
            width: "90%",
            margin: "8px auto",
            backgroundColor: "#5865F2",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "background-color 0.2s, transform 0.1s",
        });

        myButton.addEventListener("mouseenter", () => (myButton.style.backgroundColor = "#4752C4"));
        myButton.addEventListener("mouseleave", () => (myButton.style.backgroundColor = "#5865F2"));
        myButton.addEventListener("mousedown", () => (myButton.style.transform = "scale(0.97)"));
        myButton.addEventListener("mouseup", () => (myButton.style.transform = "scale(1)"));
        myButton.addEventListener("click", () => {
            BdApi.showToast("Button clicked!");
            window.alert("Hello from under Friends/Nitro!");
        });

        this.myButton = myButton;

       const tryInsert = () => {
    const container = document.querySelector('ul[aria-label="Direct Messages"] .friendsButtonContainer_e6b769');
    if (!container) return;

    if (!container.contains(this.myButton)) {
        container.appendChild(this.myButton);
        console.log("✅ Button added under Friends section!");
    }
};


        // Wait for Discord to load fully (poll every 1s)
        this.interval = setInterval(tryInsert, 1000);
        tryInsert();
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.myButton) {
            this.myButton.remove();
            this.myButton = null;
        }
        console.log("🛑 ServerBranch stopped");
    }
};
