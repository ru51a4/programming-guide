## Компилируем scss как можем. 6 декабря 2021

проект - https://github.com/ru51a4/superscss  

Шаг 1. Нужно сбилдить ast дерево
scss_node будет выглядеть так:

```js
class scss_node {
    childrens = [];
    type = '';
    selector = '';
    props = [];
    from = 0;
    through = 0;
    forVar = "";
    condition = "";
    args = [];
}
```
Да, все в кучу, но это же жаваскрипт.
Билдим ast:

```js
str = str.split("");
//функция которая пропускает ненужные символы
let next = () => {
    while (str.length) {
        let t = str.shift();
        if (t !== '\n' && t !== "\t") {
            return t;
        }
    }
}
//я привязываюсь к символу "}", а в scss 
//есть интерполяция #{$variable} 
//поэтому нам нужно смотреть предыдущий символ 
let charIsLetter = (char) => {
    let separators = [" ", "\n", "\t", "\r", ";", "}"]
    return !separators.includes(char)
}
//сюда положим результат
let scssTree = [];
let stack = [];
//в scss есть переменные
let globalVariables = [];
let t = '';
let tSelector = '';
let tType = '';
let tProp = [];
let prevCh = '';
let ch = '';
while (str.length) {
    prevCh = ch;
    ch = next();
    if (prevCh !== "#" && ch === "{") {
    //ШАГ 1 создаем scss_node
        let el = new scss_node();
        tType = "default";
        t = t.trim();
        //нода может быть обычной, миксином, фором, и иф
        if (t.includes("@mixin")) {
            tType = "mixin";
            //токенезируем аргументы
            let c = args.lex(t)
            tSelector = c[1];
            el.args = c.filter((item, i) => i !== 0 && i !== 1);
        } else if (t.includes("@for")) {
            tType = "for";
            let c = t.split(" ");
            el.forVar = c[1].trim();
            el.from = c[3].trim();
            el.through = c[5].trim();
        } else if (t.includes("@if")) {
            tType = "if"
            let c = args.lex(t)
            el.condition = c.filter((item, i) => i !== 0).join("");
        } else {
            //амперсанд
            if (t[0] === "&") {
                tType = "&"
                t = t.substring(1);
            }
            tSelector = t;
        }
        t = '';
        el.type = tType;
        tType = '';
        el.selector = tSelector;
        tSelector = '';
        //логика вложенности селекторов
        //положим проперти которые накопили
        if (tProp.length && stack[stack.length - 1]) {
            stack[stack.length - 1].props.push(...tProp);
            tProp = [];
        }
        //создаем ребенка или инициализирующую scss_node
        if (stack[stack.length - 1]) {
            stack[stack.length - 1].childrens.push(el);
            stack.push(el);
        } else {
            stack.push(el);
        }
    } else if (ch === ';') {
    //ШАГ 2 - логика обработки проперти
        t = t.trim();
        //если это переменная положим ее globalVariables
        if (t[0] === "$") {
            let c = t.split(":");
            c[0] = c[0].trim();
            c[1] = c[1].trim();
            globalVariables[c[0]] = c[1];
        } else {
            //проперти может инклюдить миксин. обработка инклюде проперти
            if (t.includes("@include")) {
                let c = args.lex(t)
                let arg = c.filter((item, i) => i !== 0 && i !== 1);
                tProp.push({type: "include", value: c[1], args: arg});
            } else {
                //обычные проперти
                tProp.push({type: "default", value: t});
            }
        }
        t = '';
    } else if (!charIsLetter(prevCh) && ch === "}") {
        //ШАГ 3 - закрывающийся символ scss_node
        //если вся вложенность кончилась и это первый элемент - пушим в резалт
        if (stack.length === 1) {
            scssTree.push(stack[stack.length - 1]);
        }
        //ложим проперти
        let el = stack.pop();
        el.props.push(...tProp);
        tProp = [];
    } else {
        t += ch;
    }
}
return {tree: scssTree, globalVariables};
```
Теперь нужно обойти наше дерево aka скомпилировать scss:

```js
//получаем ast дерево и переменные
let builder = new astBuilder();
let {tree, globalVariables} = builder.build(str);
let mixins = [];
let res = [];
let tRes = [];
let currentSelector = [];
//тут будем хранить аргументы миксинов
let localVariables = [];
//проверка на выражения в проперти - 10px + 10px
let isOperation = (str) => {
    return (str.includes("px") || str.includes("em")) &&
        (str.includes("+") || str.includes("-") || str.includes("/") || str.includes("*"))
};
//функция для получения переменных, переменная может ссылаться на другую перменную
let getVariable = (name) => {
    if (localVariables[name]) {
        return localVariables[name];
    }
    if (globalVariables[globalVariables[name]]) {
        return getVariable(globalVariables[name]);
    }
    return globalVariables[name];
};
//нам часто нужно будет токенезировать - проперти, селекторы, поэтому напишем функцию для этого
//сами лексеры я вынес в отдельные файлы в папку helpers
let lex_getVariable = (lexfunc, str, getStr = true) => {
    let t = lexfunc(str).map((item) => {
        if (item[0] === "$") {
            item = getVariable(item);
        }
        return String(item)
    });
    if (getStr) {
        return t.join("")
    } else {
        return t;
    }
}
 
let compile = (node) => {
    if (node.type === "mixin") {
        //если это миксин, положим в mixins, а потом вытащим, когда будет инклюде проперти
        mixins[node.selector] = node;
    } else if (node.type === "if") {
        //обработка иф scss_node, math логика будет ниже в статье
        let conditionTokens = lex_getVariable(math.lex, node.condition, false);
        let condRes = math.calc(conditionTokens);
        if (condRes) {
            //проверили кондишен иф, добавили проперти ноде и прошлись по детям
            // тут еще должна быть логика инклюде проперти, нужно доделать
            //todo prop include logic
            if (node.props.length) {
                tRes[tRes.length - 1].props.push(...node.props);
            }
            node.childrens.forEach((item) => {
                compile(item);
            });
        }
    } else if (node.type === "for") {
        //обработка фор scss_node
        for (let i = node.from; i <= node.through; i++) {
            //у фора есть переменные, поэтому положим их в локалВариеблес
            localVariables[node.forVar] = i;
            //тут еще должна быть логика инклюде проперти, нужно доделать
            //добавляем проперти
            //todo prop include logic
            if (node.props.length) {
                let props = node.props.map((nodeProp) => {
                    //get args variables
                    let c = nodeProp.value.split(":");
                    c[0] = c[0].trim();
                    c[1] = c[1].trim();
                    //interpalation
                    c[1] = lex_getVariable(interpalation.lex, c[1])
                    return `${c[0]}:${c[1]}`;
                });
                tRes[tRes.length - 1].props.push(...props);
            }
            delete localVariables[node.forVar]
        }
        for (let i = node.from; i <= node.through; i++) {
            //проходимся по детям
            localVariables[node.forVar] = i;
            node.childrens.forEach((item) => {
                console.log({item})
                compile(item);
            });
            delete localVariables[node.forVar]
        }
    } else {
        //обработка обычных scss_node
        let props = [];
        let cs;
        currentSelector.push({str: node.selector, type: (node.type === "&") ? "&" : ""});
        cs = currentSelector.map((item) => ((item.type === "&") ? "" : " ") + item.str).join("");
        //interpalation
        //в селекторе могут быть переменные
        cs = lex_getVariable(interpalation.lex, cs);
        //
 
        let iForDeleteLocalVariable = [];
        for (let i = 0; i <= node.props.length - 1; i++) {
            if (node.props[i].type === "include") {
                //логика инклюде проперти
                let mixin = mixins[node.props[i].value];
                //args
                //при инклюде миксина нужно не забыть про аргументы
                iForDeleteLocalVariable.push((node.childrens.length - 1) + 1);
                mixin.args.forEach((key, j) => {
                    localVariables[key] = node.props[i].args[j];
                });
                //
                //добавляем текущей ноде - проперти миксина и детей(там ифы и форы)
                node.props.splice(i + 1, 0, ...mixin.props);
                node.childrens.push(...mixin.childrens);
            } else {
                //обычная обработка проперти
                props.push(node.props[i].value);
            }
        }
        //mixin bug
        if (node.props.filter((item) => item.type !== "include").length) {
            tRes.push({lvl: currentSelector.length, cs: cs, props: props})
        }
        //проходим по детям
        node.childrens.forEach((item, i) => {
            compile(item);
            //args
            if (iForDeleteLocalVariable.includes(i)) {
                item.args.forEach((key) => {
                    delete localVariables[key];
                });
                iForDeleteLocalVariable = iForDeleteLocalVariable.filter((j) => j !== i);
            }
        });
        currentSelector.pop();
    }
}
 
//мейн
tree.forEach((item) => {
    compile(item);
    //т.к пушим в резалт мы по символу "}", при вложенности селекторов сначала идут более глубокие, поэтому отсортируем их
    res.push(tRes.sort((a, b) => a.lvl - b.lvl).map((item) => {
        let tStr = "";
        tStr += item.cs;
        tStr += "{"
        tStr += item.props.map((nodeProp) => {
            let c = nodeProp.split(":");
            c[0] = c[0].trim();
            c[1] = c[1].trim();
            //interpalation
            c[1] = lex_getVariable(interpalation.lex, c[1])
            if (isOperation(c[1])) {
                c[1] = math.calc(math.lex(c[1]))
            }
            return `${c[0]}:${c[1]};`
        }).join("");
        tStr += "}"
        return tStr;
    }).join("\n"));
    tRes = [];
});
return res.join("\n");
```
Все, компиляция готова, осталось реализовать лексеры и научиться считать арифметику

```js
static calc(str) {
    let currentUnit = '';
    let stack = [];
    stack.push([]);
    //build AST
    //строим аст дерево арифметического выражения со скобками
    while (str.length) {
        let item = str.shift();
        if (item === "(") {
            stack.push([]);
        } else if (item === ")") {
            let t = stack[stack.length - 1];
            stack.pop();
            stack[stack.length - 1].push(t);
        } else {
            currentUnit = item.match("[a-zA-Z,%\s]+$").join('');
            item = item.match(/\d+/g).join('');
            stack[stack.length - 1].push(item);
        }
    }
 
    //calc
    let start = stack[0];
    let operators = [];
    operators["+"] = (a, b) => {
        return parseInt(a) + parseInt(b);
    }
    operators["-"] = (a, b) => {
        return parseInt(a) - parseInt(b);
    }
    operators["*"] = (a, b) => {
        return parseInt(a) * parseInt(b);
    }
    operators["/"] = (a, b) => {
        return parseInt(a) / parseInt(b);
    }
    operators[">"] = (a, b) => {
        return parseInt(a) > parseInt(b);
    }
    operators[">="] = (a, b) => {
        return parseInt(a) >= parseInt(b);
    }
    operators["<="] = (a, b) => {
        return parseInt(a) <= parseInt(b);
    }
    operators["<"] = (a, b) => {
        return parseInt(a) < parseInt(b);
    }
    operators["=="] = (a, b) => {
        return parseInt(a) === parseInt(b);
    }
    operators["%"] = (a, b) => {
        return parseInt(a) % parseInt(b);
    }
 
    //функция которая калькулирует выражение
    function calc(arr) {    
        for (let i = 0; i <= arr.length - 1; i++) {
            if (arr[i] === "*" || arr[i] === "/") {
                let t = operators[arr[i]](arr[i - 1], arr[i + 1]);
                arr.splice(i - 1, 3, t);
                i = i - 1;
            }
        }
        for (let i = 0; i <= arr.length - 1; i++) {
            if (arr[i] === "%" || arr[i] === "+" || arr[i] === "-") {
                let t = operators[arr[i]](arr[i - 1], arr[i + 1]);
                arr.splice(i - 1, 3, t);
                i = i - 1;
            }
        }
        for (let i = 0; i <= arr.length - 1; i++) {
            if (arr[i] === "<=" || arr[i] === ">=" || arr[i] === "==" || arr[i] === ">" || arr[i] === "<") {
                let t = operators[arr[i]](arr[i - 1], arr[i + 1]);
                arr.splice(i - 1, 3, t);
                i = i - 1;
            }
        }
    }
    //обходим наше аст дерево и калькулируем его
    function deep(arr) {
        for (let i = 0; i <= arr.length - 1; i++) {
            if (Array.isArray(arr[i])) {
                if (arr[i].length === 1) {
                    arr[i] = arr[i][0];
                } else {
                    deep(arr[i]);
                    i = i - 1;
                }
            }
        }
        calc(arr);
    }
 
    deep(start);
    //Наш math считает кондишены и арифметику
    if (start[0] == false) {
        return false
    }
    return start[0] + currentUnit;
}
```
