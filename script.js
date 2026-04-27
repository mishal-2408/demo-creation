let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

// Utilities
const $ = id => document.getElementById(id);
function save() { localStorage.setItem('blogs', JSON.stringify(blogs)); }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

// Elements
const publishBtn = $('publishBtn');
const clearBtn = $('clearBtn');
const blogListEl = $('blogList');
const searchEl = $('search');
const sortEl = $('sort');
const countEl = $('count');

const modal = $('modal');
const modalTitle = $('modalTitle');
const modalContent = $('modalContent');
const modalClose = $('modalClose');
const modalDelete = $('modalDelete');
const modalEdit = $('modalEdit');

let activeModalId = null;

function updateCount() {
    countEl.textContent = `${blogs.length} post${blogs.length!==1? 's':''}`;
}

function addBlog() {
    const title = $('title').value.trim();
    const content = $('content').value.trim();
    if (!title || !content) { alert('Please fill all fields'); return; }

    const blog = { id: Date.now(), title, content, comments: [] };
    blogs.unshift(blog);
    save();
    $('title').value = '';
    $('content').value = '';
    render();
}

function clearForm(){ $('title').value=''; $('content').value=''; }

function render() {
    const q = (searchEl.value || '').toLowerCase();
    const sorted = [...blogs].sort((a,b)=> sortEl.value==='old' ? a.id - b.id : b.id - a.id);
    const filtered = sorted.filter(b => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q));

    blogListEl.innerHTML = '';
    filtered.forEach(b => {
        const card = document.createElement('article');
        card.className = 'card';

        const preview = b.content.length>120 ? esc(b.content.slice(0,120)) + '…' : esc(b.content);

        card.innerHTML = `
            <h3>${esc(b.title)}</h3>
            <p>${preview}</p>
            <div class="meta"><span>${new Date(b.id).toLocaleString()}</span><span>${b.comments.length} comment${b.comments.length!==1?'s':''}</span></div>
            <div class="actions">
                <button class="small-btn" data-action="view" data-id="${b.id}">View</button>
                <button class="small-btn" data-action="comment" data-id="${b.id}">Comment</button>
                <button class="small-btn" data-action="delete" data-id="${b.id}">Delete</button>
            </div>
        `;

        blogListEl.appendChild(card);
    });

    updateCount();
}

function findIndexById(id){ return blogs.findIndex(b=>b.id===id); }

function showModal(id){
    const blog = blogs.find(b=>b.id===id);
    if(!blog) return;
    activeModalId = id;
    modalTitle.textContent = blog.title;
    modalContent.textContent = blog.content;
    modal.classList.remove('hidden');
}

function hideModal(){ activeModalId = null; modal.classList.add('hidden'); }

function deleteBlog(id){
    if(!confirm('Delete this post?')) return;
    blogs = blogs.filter(b=>b.id!==id);
    save();
    render();
    hideModal();
}

function promptComment(id){
    const text = prompt('Add comment:');
    if(!text) return;
    const idx = findIndexById(id);
    if(idx===-1) return;
    blogs[idx].comments.push(text.trim());
    save();
    render();
}

// Edit modal -> prefill form for editing title/content
function editFromModal(){
    const id = activeModalId;
    const idx = findIndexById(id);
    if(idx===-1) return;
    const b = blogs[idx];
    $('title').value = b.title;
    $('content').value = b.content;
    hideModal();
}

// Event delegation for card actions
blogListEl.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    if(action==='view') showModal(id);
    else if(action==='delete') deleteBlog(id);
    else if(action==='comment') promptComment(id);
});

modalClose.addEventListener('click', hideModal);
modalDelete.addEventListener('click', ()=>{ if(activeModalId) deleteBlog(activeModalId); });
modalEdit.addEventListener('click', editFromModal);

publishBtn.addEventListener('click', addBlog);
clearBtn.addEventListener('click', clearForm);
searchEl.addEventListener('input', render);
sortEl.addEventListener('change', render);

// initial render
render();