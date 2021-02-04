const books = []

// Objeto que irá representar um livro
function Book(objeto) {
    const item = objeto["volumeInfo"]

    this.authors = item["authors"]
    this.categories = item["categories"]
    this.imageLinks = item["imageLinks"]
    this.pageCount = item["pageCount"]
    this.previewLink = item["previewLink"]
    this.publishedDate = item["publishedDate"]
    this.title = item["title"]
    this.subtitle = item["subtitle"]
    this.contentVersion = item["contentVersion"]
    this.infoLink = item["infoLink"]
    this.buyLink = objeto["saleInfo"]["buyLink"]
    this.textSnippet = objeto?.searchInfo?.textSnippet ?? "Não possui Descrição"
}


// esta função é responsavel por renderizar cada livro na tela
function renderBook(book, lastColor) {
    const colors = ["yellow", "blue", "green", "red", "slateblue", "aquamarine", "yellowgreen", "goldenrod", "rosybrown", "violet", "salmon", "khaki", "thistle", "honeydew", "azure", "lightcoral", "mediumpurple", "tan", "sienna", "seagreen", "palegreen", "skyblue", "dodgerblue"]
    const main = document.querySelector("main")
    const container = document.createElement("div")
    container.setAttribute("class", "container")
    const color = Math.floor(Math.random() * colors.length)
    if (color == lastColor && color > 0) {
        color -= 1
    } else if (color == lastColor && color == 0) {
        color += 1
    }
    container.style.backgroundColor = `${colors[color]}`

    const title = document.createElement("h2")
    title.textContent = book.title

    const subtitle = document.createElement("p")
    subtitle.textContent = book.subtitle

    const textSnippet = document.createElement("i")
    textSnippet.innerHTML = book.textSnippet

    const authors = document.createElement("p")
    authors.textContent = `Autores: ${book["authors"]?.map((value, index) => {
        if (index == 0) {
            return value
        } else {
            return " " + value
        }
    }) ?? "Não informado"}`

    const categories = document.createElement("p")
    categories.textContent = `Categorias: ${book["categories"]?.map((value, index) => {
        if (index == 0) {
            return value
        } else {
            return " " + value
        }
    }) ?? "Sem categoria"}`

    const pageCount = document.createElement("p")
    pageCount.textContent = "Páginas: " + (book.pageCount ?? "Não informado")

    const image = document.createElement("div")
    image.style.backgroundImage = `url(${book.imageLinks?.thumbnail ?? book.imageLinks?.smallThumbnail})`

    const publishedDate = document.createElement("span")
    publishedDate.textContent = "Data de publicação: " + (book?.publishedDate ?? "Data não informada")

    const contentVersion = document.createElement("span")
    contentVersion.textContent = "Versão: " + book.contentVersion

    const nav = document.createElement("nav")

    const preview = document.createElement("a")
    preview.href = book.previewLink
    preview.textContent = "Preview"

    nav.append(preview)

    const infoLink = document.createElement("a")
    infoLink.href = book.infoLink
    infoLink.textContent = "Informações"

    nav.append(infoLink)

    const buyLink = document.createElement("a")
    buyLink.href = book.buyLink
    buyLink.textContent = "Comprar"

    nav.append(buyLink)

    container.appendChild(title)
    container.appendChild(subtitle)
    container.appendChild(textSnippet)
    container.appendChild(authors)
    container.appendChild(categories)
    container.appendChild(pageCount)
    container.appendChild(image)
    container.appendChild(publishedDate)
    container.appendChild(contentVersion)
    container.appendChild(nav)

    main.appendChild(container)

}

/*
    Esta função irá fazer uma requisição que retornará os dados de no
    maximo 10 livros por requisição, e irá revificar se os livros
    são repetidos.
 */
async function getBook(querie, index) {
    const result = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${querie}&maxResults=10&startIndex=${index}`).then(async req => await req.json()).catch(err => console.log(err))

    let tamanhoInicial = books.length

    result.items?.forEach(item => {
        const book = new Book(item)
        let novoLivro = true
        books?.forEach(opcao => {
            if (opcao?.title == book?.title && opcao?.subtitle == book?.subtitle && opcao?.contentVersion == book?.contentVersion) {
                novoLivro = false
            }
        })
        
        if (novoLivro) {
            books.push(book)
        }
    })

    let tamanhoAtual = books?.length ?? 0

    let lastColor = null
    for (let i = tamanhoInicial; i < tamanhoAtual; i++) {
        lastColor = renderBook(books[i], lastColor)
    }

    return result
}

// Esta função vai ficar fazendo requisições até a quantidade de livros disponiveis
async function getAllBooks(querie) {
    let result = await getBook(querie, 0)

    const total = Math.ceil(result["totalItems"] / 10)

    for (let i = 1; i < total; i++) {
        await getBook(querie, i+1)
    }

}

// Evento inicia quando o usuario clica no botão, e a requisição será feita
document.querySelector("#buttonBusca").onclick = function(event) {
    const select = document.querySelector("#selectBusca")
    const input = document.querySelector("#inputBusca")

    if (input.value == "") {
        input.placeholder = "Preenche o campo..."
        return 0 
    }
    document.querySelector("main").innerHTML = ""
    input.placeholder = ""
    let querie = ""

    if (select.value == "search") {
        querie = input.value
    } else {
        querie = `${select.value}:${input.value}`
    }
    input.value = ""
    getAllBooks(querie)

}

document.querySelector("#inputBusca").addEventListener("keypress", event => {
    if (event.key == "Enter") {
        document.querySelector("#buttonBusca").dispatchEvent(new Event("click"))
    }
}) 