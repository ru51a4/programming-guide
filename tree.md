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
кароче есть деревья в деревьях есть:
deep first search и Breadth First Search
загугли... 

там дальше разберешься. в основом все алгоритмы это как раз дфс и бфс с доп логикой.

bds/dfs выглядит так
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
  while(queue.length) {
    let node = queue.shift();
    console.log(node.title); 
    queue.push(...node.childs)
  }
}
bfs(root);
```
dfs:
<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/3ace1705-31d4-4a6a-a75b-ccd3fa09a9d3" />
bfs:
<img width="500" height="500" alt="image" src="https://github.com/user-attachments/assets/ed0d773b-583c-40c9-baa3-3d1cd3b71c6c" />


## что может пригодиться:    
1. создание дерева (must have) попробуй написать: CRUD с иерархическим каталогом или json/xml parser
2. dfs (must have) + stack для текущ пути
3. bfs (must have)
4. получить ноды по уровням (bfs) (must have)
5. nested set (нужно знать даже битриксоидам)
6. bst
7. trie
8. dijkstra (что бы сдать лабу)
9. topological sort
10. etc...
