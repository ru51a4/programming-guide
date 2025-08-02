## гайд на деревья(алгоритмы):  
крч для начала надо понять что такое поинтер.
```
let root = {val:0};
```
разберем на линекд лист
```
let curr = root; //тк root это обьект в curr ссылка на root;
for(let i=1; i<=100; i++){
  curr.next = {val:i}            
  curr = curr.next
}
```
ну ты понял. тоесть у нас этих обьектов нет(только первый и последний), но обьекты на самом деле есть и их можно обойти например так
```
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

дерево выглядит так
```
let root = { val: 'Бабушка', childs: [] }
let mom = { val: 'Мама', childs: [] }
let _child = { val: 'Руслан', childs: [] }
root.childs.push(mom)
mom.childs.push(_child);

let dfs = (node) => {
    console.log(node.val)
    node.childs.forEach((item) => {
        dfs(item)
    });
}
dfs(root)
```

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