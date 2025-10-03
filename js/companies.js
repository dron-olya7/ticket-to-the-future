// companies.js
class CompanyPopups {
  constructor() {
    this.popupData = null;
    this.init();
  }

  async init() {
    try {
      await this.loadPopupData();
      this.setupPopup();
      this.addCompanyEventListeners();
    } catch (error) {
      console.error('Error initializing company popups:', error);
    }
  }

  async loadPopupData() {
    try {
      const response = await fetch('companies.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.popupData = await response.json();
    } catch (error) {
      console.error('Error loading popup data:', error);
      this.popupData = { companies: [] };
    }
  }

  setupPopup() {
    if (!document.getElementById('companyPopup')) {
      this.createPopup();
    }
    
    this.popup = document.getElementById('companyPopup');
    this.closeBtn = this.popup.querySelector('.popup-close');
    
    this.closeBtn.addEventListener('click', () => this.closePopup());
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) this.closePopup();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.popup.classList.contains('active')) {
        this.closePopup();
      }
    });
  }

  createPopup() {
    const popupHTML = `
      <div id="companyPopup" class="popup-overlay">
        <div class="popup-content">
          <button class="popup-close">&times;</button>
          <div class="popup-header">
            <h2 id="popupTitle"></h2>
            <span class="popup-date" id="popupDate"></span>
          </div>
          <div class="popup-body" id="popupContent"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }

  addCompanyEventListeners() {
    const companyCards = document.querySelectorAll('.company-item');
    
    companyCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.removeAttribute('data-dismiss');
      card.removeAttribute('data-toggle');
      card.removeAttribute('data-target');
      
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const companyId = card.getAttribute('data-company-id');
        if (companyId && this.popupData) {
          this.openPopup(companyId);
        }
      });
    });
  }

  openPopup(companyId) {
  const company = this.popupData?.companies?.find(c => c.id === companyId);
  if (!company) return;

  document.getElementById('popupTitle').textContent = company.title;
  document.getElementById('popupDate').textContent = company.date;
  
  const popupContent = document.getElementById('popupContent');
  popupContent.innerHTML = '';
  
  // Добавляем обычные параграфы из content
  if (Array.isArray(company.content)) {
    company.content.forEach(paragraph => {
      if (paragraph && paragraph.trim() !== '') { // Проверяем что параграф не пустой
        const p = document.createElement('p');
        p.textContent = paragraph;
        popupContent.appendChild(p);
      }
    });
  }
  
  // Добавляем список профессий если есть
  if (company.professions && Array.isArray(company.professions)) {
    const professionsTitle = document.createElement('p');
    professionsTitle.textContent = "";
    professionsTitle.style.fontWeight = '600';
    professionsTitle.style.marginTop = '20px';
    professionsTitle.style.marginBottom = '10px';
    popupContent.appendChild(professionsTitle);
    
    const ul = document.createElement('ul');
    ul.style.marginLeft = '20px';
    ul.style.marginBottom = '15px';
    ul.style.paddingLeft = '20px';
    
    company.professions.forEach(profession => {
      const li = document.createElement('li');
      li.textContent = profession;
      li.style.marginBottom = '8px';
      li.style.lineHeight = '1.4';
      ul.appendChild(li);
    });
    
    popupContent.appendChild(ul);
  }
  
  // ↓↓↓ ДОБАВЬТЕ ЭТОТ КОД ЗДЕСЬ ↓↓↓
  // Добавляем футер после списка профессий
  if (company.footer) {
    const p = document.createElement('p');
    p.textContent = company.footer;
    p.style.marginTop = '15px';
    popupContent.appendChild(p);
  }
  // ↑↑↑ ДОБАВЬТЕ ЭТОТ КОД ЗДЕСЬ ↑↑↑
  
  // Блокируем прокрутку
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  this.popup.classList.add('active');
}

  closePopup() {
    // Восстанавливаем прокрутку
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    this.popup.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CompanyPopups();
});