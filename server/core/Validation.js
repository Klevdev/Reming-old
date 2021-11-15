module.exports = { validateKeys, validateRequired, validateValues };

function validateKeys(request, rules) {
    let errors = [];
    const expected = Object.keys(rules);
    for (let key in request) {
        if (!expected.includes(key)) {
            errors.push(key);
        }
    }
    return errors.length > 0 ? { error: "Ошибка запроса: возможно, кто-то играет не по правилам", errors: errors } : { ok: 1 };
}

function validateRequired(request, rules) {
    let errors = [];
    const required = [];
    for (let rule in rules) {
        if (rules[rule].required) {
            required.push(rule);
        }
    }
    required.forEach(requiredKey => {
        if (!request.hasOwnProperty(requiredKey) || request[requiredKey] === '') {
            errors.push(requiredKey);
        }
    });
    return errors.length > 0 ? { error: "Ошибка запроса: отсутствуют необходимые поля", errors: errors } : { ok: 1 };
}

function validateValues(request, rules) {
    let errors = [];
    for (let requestProperty in request) {
        if (!rules.hasOwnProperty(requestProperty)) {
            throw new Error(`Ошибка валидации: правило не заполнено (валидируемое поле - ${key})`);
        }
        let requestValue = request[requestProperty];
        let propertyRules = rules[requestProperty];
        for (let propertyRule in propertyRules) {
            const ruleValue = propertyRules[propertyRule];
            const validator = _validators[propertyRule];
            if (typeof validator !== 'function') {
                console.error(`Функция-валидатор ${propertyRule} не зарегистрирована`);
                return { error: "Ошибка сервера" };
            }
            let result = validator(requestValue, ruleValue);
            if (result.hasOwnProperty('error')) {
                errors.push({ property: requestProperty, error: result.error });
            }
        }
    }
    return errors.length > 0 ? { error: "Ошибка запроса: неправильно заполнены поля", errors: errors } : { ok: 1 };
}

const _validators = {
    required: () => true,
    lengthRange: _lengthRange,
    restrictedChars: _restrictedChars,
    requiredChars: _requiredChars,
    email: _email,
    integer: _integer,
    date: _date,
    phone: _phone,
};

function _lengthRange(value, lengthRange) {
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
function _requiredChars(value, charTypesArray) {
    const charsString = "";
    const charTypes = {
        'integer': '0-9',
        'lc': 'a-z',
        'uc': 'A-Z',
        'special': '!@#$%^&*(){}_+'
    };
    charTypesArray.forEach(type => {
        charsString += charTypes[type];
    });
    const pattern = /^[${charsString}]$/;
    if (!pattern.test(value)) {
        return { error: `В поле должны присутствовать символы '${charsString}'` };
    }
    return true;
}

function _email(value) {
    /* Regex taken from: https://www.w3resource.com/javascript/form/email-validation.php */
    const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
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