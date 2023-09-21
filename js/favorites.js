import { GithubUser } from "./githubUser.js";

class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }
  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }
  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário Ja Cadastrado");
      }
      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário Não Encotrado");
      }
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
      if (this.entries.length === 0) {
        this.showUserInit();
      }
    } catch (error) {
      alert(error.message);
    }
  }
  showUserInit() {
    if (this.userInit) {
      this.userInit.style.display = "revert";
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries; // reatribuindo um novo array
    this.update();
    this.save();
    if (this.entries.length <= 0) {
      this.showUserInit();
    }
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");

    this.userInit = this.root.querySelector(".userInit");
    this.update();
    this.onadd();
  }
  onadd() {
    const addButton = this.root.querySelector(".search button");
    const inputField = this.root.querySelector(".search input");

    addButton.onclick = () => {
      const { value } = inputField;
      this.add(value);
    };

    inputField.addEventListener("keydown", (event) => {
      if (event.key == "Enter") {
        const { value } = inputField;
        this.add(value);
      }
    });
  }

  update() {
    this.removeAlltr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;

      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOK = confirm("Tem certeza que deseja deletar essa linha?");
        if (isOK) {
          this.delete(user);
        }
      };

      this.tbody.prepend(row); //acrescentar
    });
    if (this.entries.length === 0) {
      this.tbody.appendChild(this.userInit);
    } else {
      this.userInit.style.display = "none";
    }
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `<tr>
    <td class="user">
      <img src="https://github.com/.png" alt="" />
      <a href="" target="_blank"><p></p></a>
      <a href=""><span>/</span></a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">1234</td>
    <td><button class="remove">Remover &times;</button></td>
  </tr>
    `;
    return tr;
  }
  removeAlltr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
