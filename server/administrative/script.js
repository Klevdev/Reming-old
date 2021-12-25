window.onload = async() => {
    if (!localStorage.getItem('userToken')) {
        let email = prompt("Email");
        let password = prompt("Пароль");

        const res = await this.request({
            method: 'POST',
            path: 'users/login',
            body: JSON.stringify({
                email: email,
                password: password
            }),
            query: {
                admin: 1
            }
        });
        if (res.hasOwnProperty('error')) {
            console.log("!");
            document.body.innerHTML = 'Отказано в доступе';
            localStorage.removeItem('userToken');
        } else {
            localStorage.setItem('userToken', res.auth);
        }
    }
    search();
}

async function search() {
    document.getElementById('table').innerHTML =
        `<tr>
        <th>_id</th>
        <th>Название</th>
        <th>Тип</th>
        <th>Описание</th>
        <th>Публичный?</th>
        <th>Автор</th>
        <th>Создан</th>
        <th>Редактирован</th>
        <th>Просмотры</th>
        <th>Рейтинг</th>
        <th>Удалить</th>
    </tr>`;
    const materials = await request({
        method: 'GET',
        path: 'materials',
        query: {
            q: document.getElementById('search').value,
            admin: 1
        }
    }).then(res => res.materials);
    materials.forEach(material => {
        let row = `<tr>`;
        row += `<td>${material._id}</td>`;
        row += `<td>${material.title}</td>`;
        row += `<td>${{'set': 'Набор', 'collection': 'Коллекция'}[material.type]}</td>`;
        row += `<td>${material.description}</td>`;
        row += `<td>${material.isPublic ? 'Да' : 'Нет'}</td>`;
        row += `<td>${material.userId}</td>`;
        row += `<td>${new Date(material.timeCreated).toLocaleDateString("ru-RU")}</td>`;
        row += `<td>${material.timeUpdated ? new Date(material.timeUpdated).toLocaleDateString("ru-RU") : '-'}</td>`;
        row += `<td>${material.views ? material.views : '-'}</td>`;
        row += `<td>${material.ratingAvg ? material.ratingAvg : '-'}</td>`;
        row += `<td class='btn' onclick='deleteMaterial("${material._id}", "${material.type + 's'}")'>Удалить</td>`;
        row += `</tr>`;
        document.getElementById('table').innerHTML += row;
    });
}

async function deleteMaterial(id, type) {
    if (confirm('Подтвердите удаление')) {
        const res = await request({
            method: 'DELETE',
            path: `materials/${type}/${id}`,
        });
        if (res.hasOwnProperty('error')) {
            alert(res.error);
        } else {
            search();
        }
    }
}

async function request(params) {
    let query = "";
    if (params.query) {
        query += "?";
        for (const [key, value] of Object.entries(params.query)) {
            query += key + "=" + (Array.isArray(value) ? value.join('+') : value) + '&';
        }
    }
    const uri = "http://localhost:3000/" + params.path + query;
    try {
        const res = await fetch(uri, {
            method: params.method,
            headers: {
                'x-access-token': localStorage.getItem('userToken'),
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            body: params.hasOwnProperty("body") ? params.body : undefined
        });
        let response = await res.json();
        if (res.status !== 200) {
            console.error(response.error);
            alert(response.error);
        }
        return response;
    } catch (e) {
        console.error(e);
        alert('Ошибка выполнения запроса');

        return { error: 'Failed to fetch' };
    }
}