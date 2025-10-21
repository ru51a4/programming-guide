## rrender aka another reactjs clon

vuejs это всего лишь - xml parser + dfs + innerHTML.  
<div align="center">
<img width="230" height="177" alt="image" src="https://github.com/user-attachments/assets/1bfeaa65-2df2-4e52-9d13-9565d2a88f88" />  
  
rrender состоит из 4 сущностей
</div>

Наш rrender поддерживает следующие директивы:  
```
r-if
r-for
r-click
r-mouse
r-bind
r-bind.attr
+ жизненный цикл (init/destroy)
```
---

Итак нам нужно получить исходный хтмл (с компонентами), расскрыть хтмл компонентов, построить из них vdom, сравнить с предыдущим vdom и сделать вставки в страницу.  

Не забудем про жизненный цикл и ререндер при действиях пользователя.  

Инициализация фраеймворка выглядит так:  
```html
<html>
<script src="https://cdn.jsdelivr.net/gh/ru51a4/rrender/dist/rrender.js"></script>
<body>
    <div class="main">
        <hello />
    </div>
</body>
```
---

```js
class component_hello extends component {
    state = {
        variable: "hello",
        color: "red",
        cssColor: () => {
            return 'color:' + this.state.color + ';'
        }
    };
    body() {
        return `
        <div>
            <span r-bind="variable"></span> 
            <span r-bind.style="cssColor">world</span>
        </div>`;
    }
    init() {
        console.log('init')
    }
}
```

---

```js
var components = [
   {
     name: 'hello',
     component: component_hello
   }
];
 var Render = new render(document.querySelector(".main"), components);
 function main() {
     Render.renderDom();
 }
 main();
```
## Итак нам нужно получить исходный хтмл (с компонентами):

Пишем имена компонентов прям в хтмл, получаем их с помощью innerHtml и делаем .split("\n")

```js
constructor(_el, _components) {
  components = _components;
  this._el = _el;
  _currentDom = this._el.innerHTML.trim().split("\n");
}
_currentDom.forEach((tag) => {
  deep(tag)  
};
let deep = () => {
  let tagData = this.utils.parseTag(tag); //парсим строку html
  if (!this.utils.isComponent(tagName)) {
    currentDom += tag + "\n"; //простой хтмл тег
  } else {
      //Логика обработки компонентов
      //Жизненый цикл
      //Раскрытие хтмл компонентов
  }   
}
```
## Раскрыть хтмл компонентов:

Проверяем каждую строчку с предыдущего шага: если это не компонент - конкатенируем в результирующую строку хтмл, если это компонент - проверяем, - создавали ли его? (см пункт про жизненный цикл), создаем компонент и получаем его хтмл с помощью body();

Компонент выглядит так:
```js
class component_todo extends component {
    state = {
        counter: 0,
        todos: [
            { title: 'wash the dishes' },
            { title: 'cook lunch' },
            { title: 'cook dinner' }
        ],
    };
    body() {
        return `
            <div class="">
                <ul>
                    <li r-for="todos">
                    <span r-bind="title"></span>
                    </li>
                </uL>
                <span r-bind="counter"></span>
                <button class="btn-primary" r-click="increment">
                    +
                </button>
            </div>
        `;
       }
  
    increment() {
        this.state.counter++;
    }
  
    init() {
    	console.log('constructor')
    }
  
    destroy() {
    	console.log('destructor')
    }
}
```
Функция body обрабатывается сущностью (template.js). Она раскрывает наши аттрибуты (r-click, r-mouse) в понятный браузеру api (onclick, onmouse), а так же раскрывает r-bind, получая данные из state компонента или его методов.  
  
(template.js - просто парсит исходный html, обходит его, - конкатенируя правильно).  
  
После сборки строки хтмл, мы строим vdom (dombuilder.js) моим парсером (superxmlparser74.js), если это первый rerender вызовем сборку хтмл из vdom и вставим в корень .main  
```js
this.vdom = domBuilder.build(currentDom);
sumHtml(this.vdom[0], true);
this._el.innerHTML = html;
```
## Как работают Event's:

Подробнее про r-click:  
Создадим глобальную функцию runEvent, которую будем дергать браузером  

```html
<button class="btn btn-primary" onclick="runEvent('#todo-1', 'increment') ">
+
</button>
```
(#todo-1) - это внутреннее название компонента.  
```js
function runEvent(name, nameEvent, arg) {
    currentComponents.find((item) => {
        return item.name === name;
    }).component[nameEvent](arg);
    Render.renderDom();
}
```
Каждый раз при смене state компонента, нужно запустить ререндер. Render.renderDom().  
## Жизненный цикл и директивы r-if и r-for:

## r-if:
Каждый раз когда элемент дома имеет аттрибут r-if=false:  
Я использую nested set для каждого элемента vdom, поэтому если текущ элемент r-if=false, я соберу всех детей (компоненты) и добавлю их в массив destroy, что бы потом вызвать destroy(), и удалить их.  
Мы собираем только компоненты  
```
.filter((c) => c?.id?.includes("component"))  
```
(Компоненты тоже есть в vdom, но они не конкатенируются в результирующий хтмл.)  
```js
// render.js - 62 строчка
if (node?.attr?.find((c) => c['key'] === 'r-if')?.value[0] == 'true') {
       let key = node?.attr?.find((c) => c['key'] === 'r-key')?.value[0] //(r-key вспомогающий аттрибут где храним название проперти)
       let prevValue =
           this.prevComponents.find((c) => c.name == node.parentComponent)?.component?.state?.[key];
       let currValue =
           currentComponents.find((c) => c.name == node.parentComponent)?.component?.state?.[key];
       if (prevValue !== undefined && currValue != prevValue) {
           destroys.push(...this.prevVdom.filter((item) => node.left < item.left && node.right > item.right)
               ?.filter((c) => c?.id?.includes("component"))
               ?.map(c => c.attr?.find((c) => c['key'] === 'r-name')?.value[0])
           )
       }
}
```
## r-for:
Циклы раскрываются в template.js, r-bind'ы, - получают данные по индексу массива компонента.  
Каждый раз при изменении массива использующего r-for, я добавляю аттрибут index, и при ререндере сверяю index'ы который удалились  
```js
// render.js - 133 строчка
var diffIndexes = prevArr.map(c => c.index).filter((i) => {
    return !currArr.map(c => c.index).includes(i);
}); 
```
Потом тоже удаляем/destory()'им компоненты которые удалились в r-for.  
## Жизненный цикл:
Всем активным компонентов даем имена (аналог counter++) (render.js - 169 строчка)
```js
let currentName = ${_key}-${map[_key]}; 
```
key (название компонента), map[_key] (номер компонента в dom текущ уровня) и добавляем их в массив currentComponents, что бы понимать, когда создавать новый/когда обновить хтмл старого.  

```js
let component = currentComponents.find(item => item.name === currentName);
if(!component) {
    //Создания компонента
} else{
    //Вызов body() активного компонента
}
```
## vdom diff:

Итак после первого рендера пишем vdom в prevDom, а после второго ререндера у нас есть prevDom и (новый)vdom.

Используя dfs, сравним каждый элемент старого с новым:  
```js
//render.js - 287 строчка
let cc1 = this.vdom.find((el) => el.id == elVdom?.childrens[i]?.id);
let cc2 = this.prevVdom.find((el) => el.id == prevElVdom?.childrens[i]?.id);
let q1 = { ...cc1, childrens: "", parentComponent: "", parentNode: "", left: '', right: '' };
let q2 = { ...cc2, childrens: "", parentComponent: "", parentNode: "", left: '', right: '' };
if (JSON.stringify(q1) !== JSON.stringify(q2)) {
	//Если элементы не равны, обновим их родителя(да, в vuejs(link github), чуть сложнее, но у нас так)
}
```
[link github](https://github.com/sunyanzhe/virtual-dom/tree/master/src/diff)
  
Для того что бы сравнить vdom и с реальным dom, на моменте создания vdom (dombuilder.js) для каждого тега посчитаем numChuild (номер элемента в доме), теперь достаточно пройти из корня по numChild, и мы найдем нужный элемент в real dom  
```js
//render.js - 257 строчка
let getDomEl = (virtualDomStack) => {
     let currentDocumentDom = this._el;
     for (let i = 1; i <= virtualDomStack.length - 1; i++) {
         let numChild;
         numChild = virtualDomStack[i];
         if (currentDocumentDom.children[numChild]) {
             currentDocumentDom = currentDocumentDom.children[numChild];
         }
     }
     return currentDocumentDom;
 } 
```
Конкатенируем html из элемента (его родителя) vdom который не совпал и заменяем innerHTML:
```js
//render.js - 309 строчка
let domEl = getDomEl([...itemUpdate.prev.parent, itemUpdate.prev.id]);
html = '';
switch (itemUpdate.type) {
    case "create":
        sumHtml(itemUpdate.el, true);
        domEl.innerHTML = html;
        break;
}
```
## Итого:

Render.renderDom() -> Создание/Обновление/Удаление компонентов + раскрытие хтмл (template.js) + создание vdom (builderdom.js) + vdom diff + Нахождение real dom (getEL) с помощью numChild -> конкатенация хтмл + изменения с помощью innerHtml.
