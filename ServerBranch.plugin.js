/**
 * @name ServerBranch
 * @author Shawn Zubieta
 * @description Opens a Discord-style Servers page (like the Friends tab) listing your servers with icons and names, and allows switching.
 * @version 1.1.0
 */

module.exports = class ServerBranch {
	constructor(meta) {
		this.meta = meta;
		this.myButton = null;
		this.interval = null;
		this.panel = null;
		this.enabled = true;
		this.safeClose = false;
	}

	start() {
		console.log("🚀 ServerBranch started");
		this.createButton();
		this.startInsertLoop();
	}

	createButton() {
		const myButton = document.createElement("button");
		myButton.textContent = "Servers";
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
			if (!this.enabled) {
				BdApi.showToast("Server page is disabled. Enable it in settings.", { type: "error" });
				return;
			}
			this.openServerPage();
		});

		this.myButton = myButton;
	}

	startInsertLoop() {
		const tryInsert = () => {
			const container = document.querySelector('ul[aria-label="Direct Messages"] .friendsButtonContainer_e6b769');
			if (!container) return;
			if (!container.contains(this.myButton)) {
				container.appendChild(this.myButton);
				console.log("✅ Button added under Friends section!");
			}
		};
		this.interval = setInterval(tryInsert, 1000);
		tryInsert();
	}

	openServerPage() {
	this.closeServerPage();

	// Find the main Discord content area
	let basePanel =
		document.querySelector('.container__133bf[aria-label="Friends"]') ||
		document.querySelector('.page__5e434') ||
		document.querySelector('.content__5e434') ||
		document.querySelector('.base__5e434');

	if (!basePanel) {
		BdApi.showToast("Could not find content area.", { type: "error" });
		console.error("ServerBranch: Could not find main content container");
		return;
	}

	// Make a clean, blank background to completely replace the Friends area
	const container = document.createElement("div");
	Object.assign(container.style, {
		width: "100%",
		height: "100%",
		background: "var(--background-primary)",
		color: "var(--text-normal)",
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "center",
		padding: "0",
		overflow: "hidden",
		zIndex: "999",
		position: "relative",
	});

	// Clear all child content (so the old friends list doesn't show)
	while (basePanel.firstChild) basePanel.removeChild(basePanel.firstChild);

	// Header Bar
	const header = document.createElement("div");
	Object.assign(header.style, {
		width: "100%",
		padding: "16px 24px",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottom: "1px solid var(--background-tertiary)",
		backgroundColor: "var(--background-secondary)",
		fontWeight: "600",
		fontSize: "16px",
		boxSizing: "border-box",
	});
	header.textContent = "Servers";

	const closeBtn = document.createElement("button");
	closeBtn.textContent = "✕";
	Object.assign(closeBtn.style, {
		background: "transparent",
		border: "none",
		color: "var(--interactive-normal)",
		fontSize: "18px",
		cursor: "pointer",
	});
	closeBtn.addEventListener("click", () => this.closeServerPage());
	header.appendChild(closeBtn);
	container.appendChild(header);

	// Layout Toggle Button
	const layoutToggle = document.createElement("button");
	layoutToggle.textContent = "Toggle Grid/List";
	Object.assign(layoutToggle.style, {
		margin: "12px 0",
		padding: "6px 12px",
		backgroundColor: "#5865F2",
		color: "white",
		border: "none",
		borderRadius: "6px",
		cursor: "pointer",
		fontSize: "13px",
	});
	container.appendChild(layoutToggle);

	// Scroll Area
	const scrollArea = document.createElement("div");
	Object.assign(scrollArea.style, {
		width: "100%",
		flexGrow: "1",
		overflowY: "auto",
		display: "flex",
		flexWrap: "wrap",
		gap: "12px",
		padding: "16px 24px",
		boxSizing: "border-box",
		backgroundColor: "var(--background-primary)",
		justifyContent: "center",
		alignItems: "flex-start",
	});
	container.appendChild(scrollArea);

	// Render servers (grid default)
	let grid = true;
	this.renderServerList(scrollArea, grid);

	layoutToggle.addEventListener("click", () => {
		grid = !grid;
		scrollArea.style.display = grid ? "flex" : "block";
		this.renderServerList(scrollArea, grid);
	});

	// Append to base content area
	basePanel.appendChild(container);
	this.panel = container;
}


	getServers() {
		const GuildStore = BdApi.findModuleByProps("getGuild", "getGuilds");
		if (!GuildStore) {
			BdApi.showToast("GuildStore not found!", { type: "error" });
			return [];
		}

		const guilds = GuildStore.getGuilds();
		return Object.values(guilds).map(g => ({
			id: g.id,
			name: g.name || "(Unnamed Server)",
			icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
			memberCount: g.memberCount || g.approximateMemberCount || "Unknown",
		}));
	}

	renderServerList(container, grid) {
		container.innerHTML = "";
		const servers = this.getServers();
		if (!servers.length) {
			container.innerHTML = `<div style="padding:20px;color:var(--text-muted)">No servers found.</div>`;
			return;
		}

		for (const server of servers) {
			const card = document.createElement("div");
			Object.assign(card.style, {
				border: "1px solid var(--background-tertiary)",
				borderRadius: "8px",
				padding: "10px",
				background: "var(--background-secondary)",
				display: "flex",
				alignItems: "center",
				width: grid ? "200px" : "100%",
				cursor: "pointer",
				transition: "transform 0.1s",
				marginBottom: grid ? "0" : "8px",
			});

			card.addEventListener("mouseenter", () => (card.style.transform = "scale(1.03)"));
			card.addEventListener("mouseleave", () => (card.style.transform = "scale(1)"));

			const icon = document.createElement("img");
			icon.src = server.icon || "https://cdn.discordapp.com/embed/avatars/0.png";
			Object.assign(icon.style, {
				width: "48px",
				height: "48px",
				borderRadius: "50%",
				marginRight: "10px",
			});

			const info = document.createElement("div");
			info.style.display = "flex";
			info.style.flexDirection = "column";

			const name = document.createElement("div");
			name.textContent = server.name;
			name.style.fontWeight = "500";
			name.style.fontSize = "14px";
			name.style.color = "var(--header-primary)";

			const members = document.createElement("div");
			members.textContent = `${server.memberCount} members`;
			members.style.fontSize = "12px";
			members.style.color = "var(--text-muted)";

			info.appendChild(name);
			info.appendChild(members);
			card.appendChild(icon);
			card.appendChild(info);

			card.addEventListener("click", () => this.switchToServer(server.id));
			container.appendChild(card);
		}
	}

	switchToServer(guildId) {
		try {
			// Try the native DOM button click first
			const selector = `[data-list-item-id="guildsnav___${guildId}"]`;
			const guildButton = document.querySelector(selector);

			if (guildButton) {
				guildButton.click();
				console.log("✅ Switched by clicking guild:", guildId);
				BdApi.showToast("Switched to server!", { type: "success" });
				this.safeClose = true;
				setTimeout(() => this.closeServerPage(), 400);
				return;
			}

			// Fallback: internal module method
			const GuildModules = BdApi.Webpack.getModule(
				m => m && (typeof m.selectGuild === "function" || typeof m.transitionToGuild === "function"),
				{ first: false }
			);
			const mod = GuildModules.find(m => typeof m.selectGuild === "function") || GuildModules[0];
			const fn = mod?.selectGuild || mod?.transitionToGuild;

			if (fn) {
				fn(guildId);
				console.log("⚙️ Fallback to internal API for:", guildId);
				BdApi.showToast("Switched using internal API!", { type: "info" });
				setTimeout(() => this.closeServerPage(), 700);
				return;
			}

			throw new Error("No suitable method found.");
		} catch (err) {
			console.error("ServerBranch switchToServer error:", err);
			BdApi.showToast("Could not switch to the server.", { type: "error" });
		}
	}

	closeServerPage() {
		if (!this.panel) return;
		if (!this.safeClose) BdApi.showToast("Returned to Friends", { type: "info" });
		this.panel.remove();
		this.panel = null;
		this.safeClose = false;
	}

	getSettingsPanel() {
		const panel = document.createElement("div");
		panel.style.padding = "10px";
		panel.style.color = "var(--text-normal)";
		const label = document.createElement("label");
		label.textContent = "Enable Server Page";
		label.style.marginRight = "10px";
		const toggle = document.createElement("input");
		toggle.type = "checkbox";
		toggle.checked = this.enabled;
		toggle.addEventListener("change", () => {
			this.enabled = toggle.checked;
			BdApi.showToast(this.enabled ? "Server Page Enabled" : "Server Page Disabled", {
				type: this.enabled ? "success" : "error",
			});
			if (!this.enabled) this.closeServerPage();
		});
		panel.appendChild(label);
		panel.appendChild(toggle);
		return panel;
	}

	stop() {
		if (this.interval) clearInterval(this.interval);
		if (this.myButton) this.myButton.remove();
		this.closeServerPage();
		console.log("🛑 ServerBranch stopped");
	}
};
