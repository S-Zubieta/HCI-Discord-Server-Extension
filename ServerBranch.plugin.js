/**
 * @name ServerBranch
 * @author Shawn
 * @description Opens a custom Servers page (like the Friends tab) with a search bar, grid/list view, and real server switching using click simulation.
 * @version 1.2.0
 */

module.exports = class ServerBranch {
	constructor(meta) {
		this.meta = meta;
		this.myButton = null;
		this.panel = null;
		this.interval = null;
		this.enabled = true;
		this.safeClose = false;
	}


	start() {
		this.createButton();
		this.startInsertLoop();
		console.log("🚀 ServerBranch started!");
	}


	createButton() {
		const btn = document.createElement("button");
		btn.textContent = "Servers";
		btn.className = "serverBranch-btn";

		Object.assign(btn.style, {
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

		btn.addEventListener("mouseenter", () => (btn.style.backgroundColor = "#4752C4"));
		btn.addEventListener("mouseleave", () => (btn.style.backgroundColor = "#5865F2"));
		btn.addEventListener("mousedown", () => (btn.style.transform = "scale(0.97)"));
		btn.addEventListener("mouseup", () => (btn.style.transform = "scale(1)"));
		btn.addEventListener("click", () => {
			if (!this.enabled) {
				BdApi.showToast("Server page disabled in settings.", { type: "error" });
				return;
			}
			this.openServerPage();
		});

		this.myButton = btn;
	}

	startInsertLoop() {
		const tryInsert = () => {
			const container = document.querySelector(
				'ul[aria-label="Direct Messages"] .friendsButtonContainer_e6b769'
			);

			if (container && !container.contains(this.myButton)) {
				container.appendChild(this.myButton);
				console.log("✅ ServerBranch button inserted under Friends!");
			}
		};

		this.interval = setInterval(tryInsert, 1000);
		tryInsert();
	}


	openServerPage() {
		this.closeServerPage();

		let basePanel =
			document.querySelector('.container__133bf[aria-label="Friends"]') ||
			document.querySelector('.page__5e434') ||
			document.querySelector('.content__5e434') ||
			document.querySelector('.base__5e434');

		if (!basePanel) {
			BdApi.showToast("Could not locate Discord content area.", { type: "error" });
			return;
		}

		while (basePanel.firstChild) basePanel.removeChild(basePanel.firstChild);

		const container = document.createElement("div");
		Object.assign(container.style, {
			width: "100%",
			height: "100%",
			background: "var(--background-primary)",
			color: "var(--text-normal)",
			display: "flex",
			flexDirection: "column",
		});


		const header = document.createElement("div");
		Object.assign(header.style, {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			padding: "16px 24px",
			borderBottom: "1px solid var(--background-tertiary)",
			backgroundColor: "var(--background-secondary)",
			fontSize: "16px",
			fontWeight: "600",
		});
		header.textContent = "Servers";

		const closeBtn = document.createElement("button");
		closeBtn.textContent = "✕";
		Object.assign(closeBtn.style, {
			background: "transparent",
			border: "none",
			fontSize: "18px",
			cursor: "pointer",
			color: "var(--interactive-normal)",
		});
		closeBtn.addEventListener("click", () => this.closeServerPage());
		header.appendChild(closeBtn);

		container.appendChild(header);

	
		const searchWrap = document.createElement("div");
		Object.assign(searchWrap.style, {
			padding: "10px 24px",
			background: "var(--background-secondary)",
			borderBottom: "1px solid var(--background-tertiary)",
			display: "flex",
		});

		const searchInput = document.createElement("input");
		searchInput.placeholder = "Search servers...";
		Object.assign(searchInput.style, {
			width: "100%",
			padding: "8px 12px",
			borderRadius: "6px",
			border: "1px solid var(--background-tertiary)",
			background: "var(--channeltextarea-background)",
			color: "white",
		});

		searchWrap.appendChild(searchInput);
		container.appendChild(searchWrap);

	
		const layoutToggle = document.createElement("button");
		layoutToggle.textContent = "Toggle Grid/List";
		Object.assign(layoutToggle.style, {
			margin: "10px 24px",
			padding: "6px 12px",
			backgroundColor: "#5865F2",
			color: "white",
			border: "none",
			borderRadius: "6px",
			cursor: "pointer",
		});
		container.appendChild(layoutToggle);


		const scroll = document.createElement("div");
		Object.assign(scroll.style, {
			flexGrow: "1",
			overflowY: "auto",
			padding: "16px 24px",
			display: "flex",
			flexWrap: "wrap",
			gap: "12px",
		});
		container.appendChild(scroll);

		let grid = true;
		let servers = this.getServers();
		let filtered = servers;

		const render = () => {
			this.renderServerList(scroll, grid, filtered);
		};

		searchInput.addEventListener("input", () => {
			const term = searchInput.value.toLowerCase();
			filtered = servers.filter(s => s.name.toLowerCase().includes(term));
			render();
		});

		layoutToggle.addEventListener("click", () => {
			grid = !grid;
			scroll.style.display = grid ? "flex" : "block";
			render();
		});

		render();

		basePanel.appendChild(container);
		this.panel = container;
	}

	getServers() {
    const Store = BdApi.findModuleByProps("getGuild", "getGuilds");
    const guilds = Store?.getGuilds?.();
    if (!guilds) return [];

    return Object.values(guilds).map(g => ({
        id: g.id,
        name: g.name || "Unnamed Server",
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        memberCount: g.memberCount || g.approximateMemberCount || null
    }));
}


	renderServerList(container, grid, servers) {
    container.innerHTML = "";

    for (const s of servers) {
        const card = document.createElement("div");
        Object.assign(card.style, {
            border: "1px solid var(--background-tertiary)",
            borderRadius: "8px",
            padding: "10px",
            background: "var(--background-secondary)",
            display: "flex",
            alignItems: grid ? "center" : "flex-start",
            cursor: "pointer",
            width: grid ? "220px" : "100%",
            transition: "transform 0.1s",
            flexDirection: "row"
        });

        card.addEventListener("mouseenter", () => (card.style.transform = "scale(1.03)"));
        card.addEventListener("mouseleave", () => (card.style.transform = "scale(1)"));

        /* -------- ICON -------- */
        const img = document.createElement("img");
        img.src = s.icon || "https://cdn.discordapp.com/embed/avatars/0.png";
        Object.assign(img.style, {
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            marginRight: "12px"
        });

        /* -------- TEXT BLOCK (NAME + MEMBERS) -------- */
        const textWrap = document.createElement("div");
        textWrap.style.display = "flex";
        textWrap.style.flexDirection = "column";

        const name = document.createElement("div");
        name.textContent = s.name;
        Object.assign(name.style, {
            fontWeight: "600",
            fontSize: "14px",
            color: "var(--header-primary)",
            marginBottom: "2px"
        });

        const members = document.createElement("div");
        members.textContent = s.memberCount
            ? `${s.memberCount} members`
            : `Members hidden`;
        Object.assign(members.style, {
            fontSize: "12px",
            color: "var(--text-muted)"
        });

        textWrap.appendChild(name);
        textWrap.appendChild(members);

        card.appendChild(img);
        card.appendChild(textWrap);

        card.addEventListener("click", () => this.simulateServerClick(s.id));

        container.appendChild(card);
    }
}


	simulateServerClick(guildId) {
		try {
			const icons = document.querySelectorAll(`[data-list-item-id^="guildsnav___"]`);

			for (const el of icons) {
				const serverId = el.getAttribute("data-list-item-id")?.replace("guildsnav___", "");
				if (serverId === guildId) {
					el.click();            // simulate real server click
					el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
					el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

					BdApi.showToast("Switched to server!", { type: "success" });

					if (this.panel) this.panel.remove();
					this.panel = null;
					this.safeClose = true;
					return;
				}
			}

			BdApi.showToast("Could not locate server icon.", { type: "error" });

		} catch (err) {
			console.error("ServerBranch click error:", err);
			BdApi.showToast("Failed to switch server.", { type: "error" });
		}
	}

	closeServerPage() {
		if (!this.panel) return;

		if (!this.safeClose) {
			BdApi.showToast("Returned to Friends", { type: "info" });
		}

		this.panel.remove();
		this.panel = null;
		this.safeClose = false;
	}

	getSettingsPanel() {
		const wrap = document.createElement("div");
		wrap.style.padding = "10px";

		const label = document.createElement("label");
		label.textContent = "Enable Server Page";
		label.style.marginRight = "10px";

		const toggle = document.createElement("input");
		toggle.type = "checkbox";
		toggle.checked = this.enabled;

		toggle.addEventListener("change", () => {
			this.enabled = toggle.checked;
			BdApi.showToast(
				this.enabled ? "Server Page Enabled" : "Server Page Disabled",
				{ type: this.enabled ? "success" : "error" }
			);
			if (!this.enabled) this.closeServerPage();
		});

		wrap.appendChild(label);
		wrap.appendChild(toggle);

		return wrap;
	}

	stop() {
		if (this.interval) clearInterval(this.interval);
		if (this.myButton) this.myButton.remove();
		this.closeServerPage();
		console.log("ServerBranch stopped.");
	}
};
