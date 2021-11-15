module.exports = { validateValue };

function validateValue(value, rules) {
    for (let rule in rules) {
        const ruleValue = rules[rule];
        const validator = _validators[rule];
        if (typeof validator !== 'function') {
            console.error(`Функция-валидатор ${rule} не зарегистрирована`);
            return { error: "Ошибка валидации" };
        }
        let result = validator(value, ruleValue);
        if (result.hasOwnProperty('error')) {
            // errors.push( result.error );
            return result.error;
        }
    }
    return true;
}

const _validators = {
    required: _required,
    lengthRange: _lengthRange,
    restrictedChars: _restrictedChars,
    // requiredChars: _requiredChars,
    email: _email,
    integer: _integer,
    date: _date,
    phone: _phone,
};

function _required(value) {
    return value ? true : {error: "Поле должно быть заполнено"};
}

function _lengthRange(value, lengthRange) {
    if (value.length === 0) return true;
    let minLength = lengthRange[0];
    let maxLength = lengthRange[1];
    if (value.length < minLength || value.length > maxLength) {
        return { error: `Поле должно содержать от ${minLength} до ${maxLength} символов` };
    }
    return true;
}

function _restrictedChars(value, charsString) {
    const pattern = new RegExp(`[${charsString}]`);
    if (pattern.test(value)) {
        return { error: `В поле присутсвуют неразрешённые символы (${charsString})` };
    }
    return true;
}

// Я хз что я тут делаю и должно ли оно работать, но в этом нет особого смысла пока что
// И вообще стоит сделать отдельный валидатор для пароля (этот валидатор пока что нужен только для пароля)
// пример правила: requiredChars: ['integers', 'special', 'uc', 'lc'],
// function _requiredChars(value, charTypesArray) {
//     const charsString = "";
//     const charTypes = {
//         'integer': '0-9',
//         'lc': 'a-z',
//         'uc': 'A-Z',
//         'special': '!@#$%^&*(){}_+'
//     };
//     charTypesArray.forEach(type => {
//         charsString += charTypes[type];
//     });
//     const pattern = /^[${charsString}]$/;
//     if (!pattern.test(value)) {
//         return { error: `В поле должны присутствовать символы '${charsString}'` };
//     }
//     return true;
// }

function _email(value) {
    /* Regex taken from: https://www.w3resource.com/javascript/form/email-validation.php */
    const pattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/;
    if (!pattern.test(value)) {
        return { error: `Поле не соответствует формату E-mail` };
    }
    return true;
}

function _integer(value) {
    const pattern = /[^0-9]/;
    if (pattern.test(value)) {
        return { error: `Поле не соответствует целого числа` };
    }
    return true;
}

function _date(value) {}

function _phone(value) {}