// consultation.js
class ConsultationPopup {
  constructor() {
    this.popup = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    this.createPopup();
    if (this.popup) {
      this.setupPopup();
      this.addEventListeners();
      this.isInitialized = true;
    }
  }

  createPopup() {
    // Сначала проверяем, не существует ли уже попап
    if (!document.getElementById('consultationPopup')) {
      const popupHTML = `
        <div id="consultationPopup" class="popup-overlay">
          <div class="popup-content consultation-popup">
            <button class="popup-close consultation-close">&times;</button>
            <div class="consultation-header">
              <h2>Получить консультацию</h2>
            </div>
            <form class="consultation-form" id="consultationForm" novalidate>
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
              <button type="submit" class="btn btn-submit consultation-submit">Отправить заявку</button>
              <div class="form-agreement">
                <p>Нажимая кнопку, вы соглашаетесь с <a href="#">политикой конфиденциальности</a></p>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
    
    this.popup = document.getElementById('consultationPopup');
  }

  setupPopup() {
    if (!this.popup) return;
    
    this.closeBtn = this.popup.querySelector('.consultation-close');
    this.form = this.popup.querySelector('#consultationForm');
    
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
    const consultationButtons = document.querySelectorAll('[data-target="order_widget_mdl_popup"]');
    
    consultationButtons.forEach(button => {
      button.removeAttribute('data-dismiss');
      button.removeAttribute('data-toggle');
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPopup();
      });
    });
  }

  openPopup() {
    if (!this.popup) {
      console.error('Popup not found');
      return;
    }
    
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
          // Очищаем номер от всех нецифровых символов
          const cleanPhone = value.replace(/\D/g, '');
          
          // Проверяем российские номера
          if (cleanPhone.startsWith('7') || cleanPhone.startsWith('8')) {
            // Для номеров начинающихся с 7 или 8 должно быть 11 цифр
            if (cleanPhone.length !== 11) {
              errorMessage = 'Номер телефона должен содержать 11 цифр';
              isValid = false;
            }
          } else if (cleanPhone.startsWith('+7')) {
            // Для +7 проверяем что после +7 идет 10 цифр
            const digitsAfterPlus = cleanPhone.slice(1); // убираем +
            if (digitsAfterPlus.length !== 11) {
              errorMessage = 'Номер телефона должен содержать 11 цифр';
              isValid = false;
            }
          } else {
            // Для других форматов
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
    
    // Сначала очищаем все ошибки
    this.clearAllErrors();
    
    // Проверяем каждое поле
    this.inputs.forEach(input => {
      if (input.hasAttribute('required')) {
        const fieldValue = input.value.trim();
        
        // Если поле пустое, сразу показываем ошибку
        if (!fieldValue) {
          this.validateField(input); // Это покажет ошибку "Пожалуйста, введите..."
          isValid = false;
        } else {
          // Если поле не пустое, валидируем его
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
    
    // Валидируем форму
    if (!this.validateForm()) {
      // Фокус на первое поле с ошибкой
      const firstErrorField = this.form.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }
    
    // Собираем данные формы
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name').trim(),
      phone: formData.get('phone').trim(),
      email: formData.get('email').trim()
    };
    
    // Показываем загрузку
    this.showLoading();
    
    // Имитация отправки на сервер
    setTimeout(() => {
      console.log('Данные формы:', data);
      this.showSuccessMessage();
    }, 1500);
  }

  showLoading() {
    const submitBtn = this.form.querySelector('.consultation-submit');
    if (!submitBtn) return;
    
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    // Сохраняем оригинальный текст для восстановления
    submitBtn.setAttribute('data-original-text', originalText);
  }

  hideLoading() {
    const submitBtn = this.form.querySelector('.consultation-submit');
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
    
    const popupContent = this.popup.querySelector('.consultation-popup');
    if (!popupContent) return;
    
    const originalContent = popupContent.innerHTML;
    
    popupContent.innerHTML = `
      <button class="popup-close consultation-close">&times;</button>
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h3>Заявка отправлена!</h3>
        <p>Мы свяжемся с вами в ближайшее время</p>
        <button class="btn btn-submit success-close">Закрыть</button>
      </div>
    `;
    
    this.popup.querySelector('.consultation-close').addEventListener('click', () => {
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
      const popupContent = this.popup.querySelector('.consultation-popup');
      if (popupContent) {
        popupContent.innerHTML = originalContent;
        this.setupPopup();
      }
    }, 300);
  }
}

// Инициализация только после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  new ConsultationPopup();
});