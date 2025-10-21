## гайд на деревья(алгоритмы):  
крч для начала надо понять что такое поинтер.
```js
let root = {val:0};
```
разберем на линекд лист
```js
let curr = root; //тк root это обьект в curr ссылка на root;
for(let i=1; i<=100; i++){
  curr.next = {val:i}            
  curr = curr.next
}
```
ну ты понял. тоесть у нас этих обьектов нет(только первый и последний), но обьекты на самом деле есть и их можно обойти например так
```js
let next = (node) => {
    console.log(node.val)
    if (node.next) {
        next(node.next)
    }
}
next(root)
```
  
обьекты можно клонировать(это нужно например когда хочется посчитать изменения. ну и вообще много кейсов).  
в js например это делается так:
```js
let clone = JSON.parse(JSON.stringify(object))
```
---

кароче есть деревья в деревьях есть:
deep first search и Breadth First Search
загугли... 

там дальше разберешься. в основом все алгоритмы это как раз дфс и бфс с доп логикой.

bfs/dfs выглядит так
```js
let catalog = [
    {
        id: 1,
        title: 'Каталог',
        parent_id: null,
        childs: [],
    },
    {
        id: 2,
        title: 'Туфли',
        parent_id: 1,
        childs: [],
    },
    {
        id: 3,
        title: 'Мужские туфли',
        parent_id: 2,
        childs: [],
    },
    {
        id: 4,
        title: 'Женские туфли',
        parent_id: 2,
        childs: [],
    },
    {
        id: 5,
        title: 'Футболки',
        parent_id: 1,
        childs: [],
    },
]
let root = catalog[0];
for (let i = 1; i <= catalog.length - 1; i++) {
    catalog.find((c) => c.id == catalog[i].parent_id).childs.push(catalog[i]);
}
let stack = [];
let dfs = (node) => {
    //1
    stack.push(node.title)
    console.log(stack.join("->"))
    node.childs.forEach((item) => {
        dfs(item) //goto 1, уровня ниже
        //2
    });
    stack.pop();
    //goto 2, уровня выше
}
dfs(root)

//bfs:

let bfs = (root_node) => {
  let queue = [root_node];
  while (queue.length) {
    let node = queue.shift();
    console.log(node.title);
    queue.push(...node.childs)
  }
}

bfs(root);

```
<details>
<summary>dfs:</summary>  
<img alt="image" src="https://upload.wikimedia.org/wikipedia/commons/7/7f/Depth-First-Search.gif" />
</details>
  
<details>
<summary>bfs:</summary>  
<img alt="image" src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Breadth-First-Search-Algorithm.gif" />
</details>

## что может пригодиться:    
1. создание дерева (must have) попробуй написать: CRUD с иерархическим каталогом или json/xml parser
2. dfs (must have) + stack для текущ пути
3. bfs (must have)
4. получить ноды по уровням (bfs) (must have) используется например чтобы собрать многоуровневое меню.
5. nested set - нужен в крудах - (используется даже в БУС)
6. bst - в крудах не нужен. но нужно для понимания более сложных структур. 
7. trie - отлично подойдет если будете делать движок для кроссвордов.
8. dijkstra (что бы сдать лабу, ну или если захотите написать рогалик)
9. topological sort 
10. рекурсивный спуск - по сути dfs без дерева - (нужен везде и всюду), например: интерпретатор, генерация строк
11. etc...  

extra:
представь рукурсивные вызовы оператором goto. те происходит переходы по строчкам внутри рекурсивной функции + мутация переменных из вне - которые нам и нужны.

