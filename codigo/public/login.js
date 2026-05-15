function login() {

  // PEGAR VALORES
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  // VALIDAR CAMPOS
  if (email === "" || senha === "") {

    alert("Preencha todos os campos");

    return;
  }

  // BUSCAR USUÁRIOS
  fetch("http://localhost:3000/usuarios")

    .then(response => response.json())

    .then(usuarios => {

      // VERIFICAR USUÁRIO
      const usuario = usuarios.find(user =>

        user.email === email &&
        user.senha === senha

      );

      // LOGIN CORRETO
      if (usuario) {

        // SALVAR USUÁRIO
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(usuario)
        );

        // ADMIN
        if (usuario.tipo === "admin") {

          window.location.href = "dashboard.html";

        }

        // USUÁRIO
        else {

          window.location.href = "dashboard-usuario.html";

        }

      }

      // LOGIN INCORRETO
      else {

        alert("Email ou senha inválidos");

      }

    })

    .catch(error => {

      console.log(error);

      alert("Erro ao conectar com o servidor");

    });

}

