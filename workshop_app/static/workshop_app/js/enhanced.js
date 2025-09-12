//js

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const bookingForm = document.getElementById('bookingForm');
const toast = document.getElementById('toast');

const workshops = [
  { id: 1, title: "Python Basics", desc: "Learn Python fundamentals", category: "python" },
  { id: 2, title: "Web Development", desc: "Build responsive websites", category: "web" },
  { id: 3, title: "Intro to ML", desc: "Start with Machine Learning", category: "ml" }
];

const cardsRoot = document.getElementById('cards');

function renderCards(list) {
  cardsRoot.innerHTML = '';
  list.forEach(w => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${w.title}</h3>
      <p>${w.desc}</p>
      <button class="btn primary">Book Now</button>
    `;
    card.querySelector('button').addEventListener('click', () => openModal(w));
    cardsRoot.appendChild(card);
  });
}

function openModal(workshop) {
  modalTitle.textContent = `Book: ${workshop.title}`;
  document.getElementById('workshopId').value = workshop.id;
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('name').focus();
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!name || !email || !phone) {
    return showToast('Please fill all required fields');
  }

  showToast('Booking confirmed!');
  closeModal();

  const all = JSON.parse(localStorage.getItem('bookings') || '[]');
  all.push({ name, email, phone, ts: Date.now() });
  localStorage.setItem('bookings', JSON.stringify(all));
});

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

renderCards(workshops);
