// criando um array pra armazenar os manhwas
const savedManhwas = [];

// checo primeiro se, ao carregar a pág, já existem mangás ou manhwas salvos no local storage!
// se existirem, eu carrego eles primeiro :)
document.addEventListener('DOMContentLoaded', () => {
    const currentLocalStorage = JSON.parse(localStorage.getItem('manhwas'));

    if (currentLocalStorage) {
        currentLocalStorage.forEach((manhwa, index) => {
            // fazendo o destructuring do objeto!!
            const { mangaTitle, mangaCover, mangaSynopsis, mangaUrl, mangaReview } = manhwa;

            // chamando a função pra criar esses elementos de novo!!
            createCard(mangaTitle, mangaCover, mangaSynopsis, mangaUrl, mangaReview, index);
        });
    };
});

// aqui eu pego os valores do formulário, impeço o comportamento padrão
// (que é reload), e depois chamo a função fetchAPI com o nome do manga
// ou manhwa, para que eu consiga fazer a pesquisa lá!
const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const userChoice = document.getElementById('choice').value;
    const url = document.getElementById('url').value;
    const review = document.getElementById('review').value;

    if (userChoice && url) {
        fetchAPI(userChoice, url, review);
        form.reset();
    };
});

// aqui eu faço a requisição para a API propriamente dita. Uso o endpoint
// de pesquisa para obter infos como o título, a capa e a sinopse
// obs: usando async/await para deixar mais limpo e legível
async function fetchAPI(userChoice, url, review) {
    try {
        const res = await fetch(`https://api.jikan.moe/v4/manga?q=${userChoice}&limit=1`);

        if (!res.ok) {
            throw new Error('Erro na requisição da API');
        }

        // obtenho os dados em JSON e armazeno nas variáveis
        const data = await res.json();
        const title = data.data[0].title;
        const cover = data.data[0].images.jpg.image_url;
        const synopsis = data.data[0].synopsis;

        // salvo no localStorage tb!
        const index = saveToLocalStorage(title, cover, synopsis, url, review);

        // depois chamo a função que cria o card e o coloca na tela
        createCard(title, cover, synopsis, url, review, index);

    } catch (error) {
        console.error('Erro ao buscar os dados da API:', error);
    }
};

function saveToLocalStorage(title, cover, synopsis, url, review, index) {
    // crio um objeto pra armazenar todos os valores e depois adiciono ao local storage
    const everyUserInput = {};
    everyUserInput.mangaTitle = title;
    everyUserInput.mangaCover = cover;
    everyUserInput.mangaSynopsis = synopsis;
    everyUserInput.mangaUrl = url;
    everyUserInput.mangaReview = review;

    savedManhwas.push(everyUserInput);
    localStorage.setItem('manhwas', JSON.stringify(savedManhwas));

    // eu retorno o índice pra sempre passá-lo na função de criar o card!
    // isso vai me permitir saber qual item devo editar e deletar depois
    return savedManhwas.length - 1; 
};

function createCard(title, cover, synopsis, url, review, index) {
    const cardsContainer = document.querySelector('.cards-container');
    
    // crio a div do card
    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');

    // crio a div da esquerda (left)
    const left = document.createElement('div');
    left.classList.add('left');

    // crio a div da direita (right)
    const right = document.createElement('div');
    right.classList.add('right');

    // aqui eu adiciono os elementos (foto, titulo, sinopse) no card
    left.innerHTML = `<img src="${cover}" alt="Capa do ${title}">`;

    // crio a div para título e botão de editar
    const titleAndEdit = document.createElement('div');
    titleAndEdit.classList.add('title-and-edit');

    // crio o h3 com o título
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;

    // crio o botão de editar
    const editButton = document.createElement('button');
    editButton.classList.add('edit');
    editButton.innerHTML = `<i class="fa-regular fa-pen-to-square"></i>`;

    // adiciono evento ao botão de editar
    editButton.addEventListener('click', (e) => {
        const cardToEdit = e.target.closest('.flip');
        const index = cardToEdit.dataset.index;
        editCard(cardToEdit, index);

        // garanto que o foco vai direto pra o primeiro campo de input (foco no formulário!)
        const firstInput = document.getElementById('choice');
        firstInput.focus();
    });

    // adiciono o título e o botão de editar na div criada
    titleAndEdit.appendChild(titleElement);
    titleAndEdit.appendChild(editButton);
    
    // adiciono a div c/ título e edit, assim como a sinopse, tudo na direita
    right.appendChild(titleAndEdit);
    
    // crio o parágrafo com a sinopse e adiciono na direita
    const synopsisParagraph = document.createElement('p');
    synopsisParagraph.textContent = synopsis;
    right.appendChild(synopsisParagraph);

    // aqui eu crio o div para armazenar os botões
    const buttons = document.createElement('div');
    buttons.classList.add('buttons');

    // aqui eu crio o botão "Ler" com o link para o manga/manhwa
    const readMoreBtn = document.createElement('button');
    readMoreBtn.classList.add('link-read');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.textContent = 'Ler';
    readMoreBtn.appendChild(link);

    // aqui eu crio o botão "Opinião" que terá um evento de clique
    // para "rodar" o card e mostrar a parte de trás
    const reviewBtn = document.createElement('button');
    reviewBtn.textContent = 'Opinião';
    reviewBtn.classList.add('review');

    // adiciono evento no botão de opinião. Ele que disparará o efeito de flip!!
    reviewBtn.addEventListener('click', () => {
        flipped.classList.add('flipped');
    });

    // aqui eu adiciono os botões na div dos botões
    buttons.appendChild(readMoreBtn);
    buttons.appendChild(reviewBtn);

    // aqui eu adiciono a div dos botões na parte direita do card
    right.appendChild(buttons);

    // aqui eu adiciono os elementos left e right no card
    cardFront.appendChild(left);
    cardFront.appendChild(right);

    // crio o div que fará o efeito de flip (no css)
    const flipped = document.createElement('div');
    flipped.classList.add('flip');

    // adiciono um dataset com o indice recebido que será usado na parte de edição e remoção
    flipped.dataset.index = index;

    // adiciono o div de flipped (que terá parte da frente e trás do card)
    flipped.appendChild(cardFront);

    // crio a parte de trás do card
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');

    const backTitle = document.createElement('h3');
    backTitle.textContent = 'Minha opinião';

    const backParagraph = document.createElement('p');
    backParagraph.textContent = review || "Nenhum comentário ainda :(";

    const goBackBtn = document.createElement('button');
    goBackBtn.textContent = 'Voltar';
    goBackBtn.classList.add('go-back');

    // adiciono botão de voltar que remove a classe flipped (e faz voltar pra página anterior)
    goBackBtn.addEventListener('click', () => {
        flipped.classList.remove('flipped');
    });

    // adiciono o cardBack ao flipped!!
    flipped.appendChild(cardBack);

    cardBack.appendChild(backTitle);
    cardBack.appendChild(backParagraph);
    cardBack.appendChild(goBackBtn);

    // aqui eu adiciono o card no container dos cards
    cardsContainer.appendChild(flipped);
};

function editCard(card, index) {
    const front = card.querySelector('.card-front');
    const back = card.querySelector('.card-back');

    // aqui eu pego os valores atuais do card e coloco no formulário
    document.getElementById('choice').value = front.querySelector('h3').textContent;
    document.getElementById('url').value = front.querySelector('.link-read a').href;
    document.getElementById('review').value = back.querySelector('p').textContent;

    // crio o botão de submissão do form (terei que adicioná-lo dinamicamente)
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('id', 'submit-btn');
    submitButton.textContent = 'Adicionar';

    // pego a div que vai ter os botões do form
    const formButtons = document.querySelector('.form-buttons');
    formButtons.innerHTML = '';

    // aqui eu removo o botão de adicionar e coloco um só de atualizar
    const updateButton = document.createElement('button');
    updateButton.setAttribute('id', 'update-btn');
    updateButton.textContent = 'Atualizar';
    formButtons.appendChild(updateButton);

    // quando o usuário aperta em atualizar, eu pego os novos valores e coloco no card
    // e também atualizo no local storage
    updateButton.addEventListener('click', () => {
        const newTitle = document.getElementById('choice').value;
        const newUrl = document.getElementById('url').value;
        const newReview = document.getElementById('review').value;

        front.querySelector('h3').textContent = newTitle;
        front.querySelector('.link-read a').href = newUrl;
        back.querySelector('p').textContent = newReview;

        // atualizo os valores c/ a ajuda do indice
        savedManhwas[index].mangaTitle = newTitle;
        savedManhwas[index].mangaUrl = newUrl;
        savedManhwas[index].mangaReview = newReview;

        localStorage.setItem('manhwas', JSON.stringify(savedManhwas)); 
        
        form.reset();
        formButtons.innerHTML = '';
        formButtons.appendChild(submitButton);
    });

    // crio também um botão para apagar o card e coloco ele do lado do botão de atualizar no form
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('id', 'delete-btn');
    deleteButton.textContent = 'Apagar';

    // adiciono evento no botão de apagar (remove o card e volta o form ao estado inicial)
    deleteButton.addEventListener('click', () => {
        card.remove();

        savedManhwas.splice(index, 1);

        localStorage.setItem('manhwas', JSON.stringify(savedManhwas));

        // reseto o formulário e o botão de submit
        form.reset();
        formButtons.innerHTML = '';
        formButtons.appendChild(submitButton);

        // atualizo também os índices (dataset.index) dos cards restantes para evitar problemas futuros
        document.querySelectorAll('.flip').forEach((c, newIndex) => {
            c.dataset.index = newIndex;
        });
    });

    formButtons.appendChild(deleteButton);
};
