// materials-popup.js
class MaterialsPopup {
  constructor() {
    this.popup = null;
    this.isInitialized = false;
    this.exitIntentTriggered = false;
    this.init();
  }

  init() {
    this.createPopup();
    if (this.popup) {
      this.setupPopup();
      this.addEventListeners();
      this.addExitIntentListener();
      this.isInitialized = true;
    }
  }

  createPopup() {
    if (!document.getElementById('materialsPopup')) {
      const popupHTML = `
        <div id="materialsPopup" class="popup-overlay">
          <div class="popup-content materials-popup">
            <button class="popup-close materials-close">&times;</button>
            <div class="materials-header">
              <h2>Получить от нас подарок!</h2>
              <p>Уходите? Получите полезные материалы перед уходом!</p>
            </div>
            <form class="materials-form" id="materialsForm" novalidate>
              <div class="form-group">
                <input type="text" name="name" placeholder="Ваше имя" required>
                <div class="error-message" data-error="name"></div>
              </div>
              <div class="form-group">
                <input type="tel" name="phone" placeholder="Ваш телефон" required>
                <div class="error-message" data-error="phone"></div>
              </div>
              <div class="form-group">
                <input type="email" name="email" placeholder="Ваш email" required>
                <div class="error-message" data-error="email"></div>
              </div>
              <button type="submit" class="btn btn-submit materials-submit">Получить подарок</button>
              <div class="form-agreement">
                <p>Нажимая кнопку, вы соглашаетесь с <a href="#">политикой конфиденциальности</a></p>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
    
    this.popup = document.getElementById('materialsPopup');
  }

  setupPopup() {
    if (!this.popup) return;
    
    this.closeBtn = this.popup.querySelector('.materials-close');
    this.form = this.popup.querySelector('#materialsForm');
    
    if (!this.form) return;
    
    this.inputs = this.form.querySelectorAll('input');
    
    // Закрытие по кнопке
    this.closeBtn.addEventListener('click', () => this.closePopup());
    
    // Закрытие по клику вне попапа
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.closePopup();
      }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.popup.classList.contains('active')) {
        this.closePopup();
      }
    });
    
    // Обработка формы
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Валидация при вводе
    this.inputs.forEach(input => {
      input.addEventListener('blur', (e) => this.validateField(e.target));
      input.addEventListener('input', (e) => this.clearError(e.target));
    });

    // Запрет на ввод букв для телефона
    const phoneInput = this.form.querySelector('input[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => this.formatPhoneInput(e.target));
      phoneInput.addEventListener('keypress', (e) => this.restrictPhoneInput(e));
    }
  }

  addEventListeners() {
    const materialsButtons = document.querySelectorAll('[data-target="order_widget_mdl_materials-popup"]');
    
    materialsButtons.forEach(button => {
      button.removeAttribute('data-dismiss');
      button.removeAttribute('data-toggle');
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPopup('button');
      });
    });
  }

  // Добавляем обработчик для определения ухода со страницы
  addExitIntentListener() {
    // Отслеживаем движение мыши к верхнему краю окна
    document.addEventListener('mouseout', (e) => {
      if (e.clientY < 0 && !this.exitIntentTriggered) {
        this.handleExitIntent();
      }
    });

    // Отслеживаем попытку уйти со страницы
    window.addEventListener('beforeunload', (e) => {
      if (!this.exitIntentTriggered) {
        // Можно показать попап вместо стандартного сообщения браузера
        e.preventDefault();
        e.returnValue = '';
        this.handleExitIntent();
      }
    });

    // Отслеживаем нажатие клавиш (например, Alt+Tab, Win+D)
    document.addEventListener('keydown', (e) => {
      if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'd')) {
        if (!this.exitIntentTriggered) {
          this.handleExitIntent();
        }
      }
    });

    // Отслеживаем изменение видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !this.exitIntentTriggered) {
        this.handleExitIntent();
      }
    });
  }

  handleExitIntent() {
    // Проверяем, не показывался ли уже попап при уходе
    if (this.exitIntentTriggered) return;
    
    // Проверяем, не заполнена ли уже форма (можно сохранять в localStorage)
    const formSubmitted = localStorage.getItem('materialsFormSubmitted');
    if (formSubmitted) return;
    
    // Показываем попап
    this.openPopup('exit');
    this.exitIntentTriggered = true;
    
    // Записываем в localStorage, что показывали попап
    localStorage.setItem('exitIntentShown', 'true');
  }

  openPopup(source = 'unknown') {
    if (!this.popup) {
      console.error('Popup not found');
      return;
    }

    // Не показываем, если пользователь уже отправил форму
    const formSubmitted = localStorage.getItem('materialsFormSubmitted');
    if (formSubmitted) return;

    console.log(`Popup opened from: ${source}`);
    
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    this.popup.classList.add('active');
    
    const firstInput = this.popup.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
  }

  closePopup() {
    if (!this.popup) return;
    
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    this.popup.classList.remove('active');
    
    if (this.form) {
      this.form.reset();
      this.clearAllErrors();
    }
  }

  // Запрет на ввод букв для телефона
  restrictPhoneInput(e) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', ' ', '(', ')', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    
    if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  }

  // Форматирование ввода телефона
  formatPhoneInput(input) {
    let value = input.value.replace(/[^\d+]/g, '');
    
    // Автоматическое добавление +7 если начинается с 7 или 8
    if (value.startsWith('7') && !value.startsWith('+7')) {
      value = '+7' + value.slice(1);
    } else if (value.startsWith('8') && value.length === 1) {
      value = '+7';
    }
    
    // Форматирование номера
    if (value.startsWith('+7')) {
      let formattedValue = '+7';
      const numbers = value.slice(2).replace(/\D/g, '');
      
      if (numbers.length > 0) {
        formattedValue += ' (' + numbers.slice(0, 3);
      }
      if (numbers.length > 3) {
        formattedValue += ') ' + numbers.slice(3, 6);
      }
      if (numbers.length > 6) {
        formattedValue += '-' + numbers.slice(6, 8);
      }
      if (numbers.length > 8) {
        formattedValue += '-' + numbers.slice(8, 10);
      }
      
      input.value = formattedValue;
    } else {
      input.value = value;
    }
  }

  // Валидация отдельных полей
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    switch(fieldName) {
      case 'name':
        if (!value) {
          errorMessage = 'Пожалуйста, введите ваше имя';
          isValid = false;
        } else if (value.length < 2) {
          errorMessage = 'Имя должно содержать минимум 2 символа';
          isValid = false;
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(value)) {
          errorMessage = 'Имя может содержать только буквы, пробелы и дефисы';
          isValid = false;
        } else if (value.length > 50) {
          errorMessage = 'Имя не должно превышать 50 символов';
          isValid = false;
        }
        break;

      case 'phone':
        if (!value) {
          errorMessage = 'Пожалуйста, введите ваш телефон';
          isValid = false;
        } else {
          const cleanPhone = value.replace(/\D/g, '');
          
          if (cleanPhone.startsWith('7') || cleanPhone.startsWith('8')) {
            if (cleanPhone.length !== 11) {
              errorMessage = 'Номер телефона должен содержать 11 цифр';
              isValid = false;
            }
          } else if (cleanPhone.startsWith('+7')) {
            const digitsAfterPlus = cleanPhone.slice(1);
            if (digitsAfterPlus.length !== 11) {
              errorMessage = 'Номер телефона должен содержать 11 цифр';
              isValid = false;
            }
          } else {
            if (cleanPhone.length < 10) {
              errorMessage = 'Номер телефона должен содержать не менее 10 цифр';
              isValid = false;
            }
          }
        }
        break;

      case 'email':
        if (!value) {
          errorMessage = 'Пожалуйста, введите ваш email';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Введите корректный email адрес';
          isValid = false;
        } else if (value.length > 100) {
          errorMessage = 'Email не должен превышать 100 символов';
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      this.showError(field, errorMessage);
    } else {
      this.clearError(field);
    }

    return isValid;
  }

  // Показать ошибку
  showError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  // Очистить ошибку
  clearError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  // Очистить все ошибки
  clearAllErrors() {
    if (!this.inputs) return;
    
    this.inputs.forEach(input => {
      this.clearError(input);
    });
  }

  // Валидация всей формы
  validateForm() {
    if (!this.inputs) return false;
    
    let isValid = true;
    
    this.clearAllErrors();
    
    this.inputs.forEach(input => {
      if (input.hasAttribute('required')) {
        const fieldValue = input.value.trim();
        
        if (!fieldValue) {
          this.validateField(input);
          isValid = false;
        } else {
          if (!this.validateField(input)) {
            isValid = false;
          }
        }
      }
    });
    
    return isValid;
  }

  handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      const firstErrorField = this.form.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }
    
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name').trim(),
      phone: formData.get('phone').trim(),
      email: formData.get('email').trim()
    };
    
    this.showLoading();
    
    setTimeout(() => {
      console.log('Данные формы (подарок):', data);
      
      // Сохраняем в localStorage, что форма отправлена
      localStorage.setItem('materialsFormSubmitted', 'true');
      
      this.showSuccessMessage();
    }, 1500);
  }

  showLoading() {
    const submitBtn = this.form.querySelector('.materials-submit');
    if (!submitBtn) return;
    
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    submitBtn.setAttribute('data-original-text', originalText);
  }

  hideLoading() {
    const submitBtn = this.form.querySelector('.materials-submit');
    if (!submitBtn) return;
    
    const originalText = submitBtn.getAttribute('data-original-text');
    
    if (originalText) {
      submitBtn.textContent = originalText;
    }
    submitBtn.disabled = false;
  }

  showSuccessMessage() {
    this.hideLoading();
    if (!this.popup) return;
    
    const popupContent = this.popup.querySelector('.materials-popup');
    if (!popupContent) return;
    
    const originalContent = popupContent.innerHTML;
    
    popupContent.innerHTML = `
      <button class="popup-close materials-close">&times;</button>
      <div class="success-message">
        <div class="success-icon">🎁</div>
        <h3>Подарок скоро будет у вас!</h3>
        <p>Мы отправили материалы на вашу почту. Проверьте папку "Входящие" или "Спам"</p>
        <button class="btn btn-submit success-close">Закрыть</button>
      </div>
    `;
    
    this.popup.querySelector('.materials-close').addEventListener('click', () => {
      this.closePopup();
      this.restoreOriginalContent(originalContent);
    });
    
    this.popup.querySelector('.success-close').addEventListener('click', () => {
      this.closePopup();
      this.restoreOriginalContent(originalContent);
    });
  }

  restoreOriginalContent(originalContent) {
    setTimeout(() => {
      const popupContent = this.popup.querySelector('.materials-popup');
      if (popupContent) {
        popupContent.innerHTML = originalContent;
        this.setupPopup();
      }
    }, 300);
  }
}

// Инициализация обоих попапов
document.addEventListener('DOMContentLoaded', () => {
  new ConsultationPopup();
  new MaterialsPopup();
});