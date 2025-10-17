## rxjs aka шарим данные
rxjs состоит из Observable(Subject) : сущность которая может принимать в себя данные(метод next) и оповещать слушателей(метод subscribe) т.е:
```js
class store {
    notificateObservable = {};
    constructor(){
        this.notificateObservable = new Subject<any>();
    }
}

window.store = new store();

class componentChat {
    formSubmit() {
        window.store.notificateObservable.next(true);
    }
}

class componentLayout(){
    constructor(){
        window.store.notificateObservable.subscribe(() => {
            window.notificater("Сообщение отправлено");
        })
    }
}
```
те когда мы в наш store.notificateObservable передаем новое значения, подписчики(со всего приложения) подхватят его и обновять свои state(например в ангуляре).

те rxjs дает возможность шарить данные по всему приложению. (почему redux лучше - не знаю. советую изучать сторы именно с rxjs)

---

есть еще pipe() - возможность изменять поток данных которые придут в наших слушателей.  
я обычно использую разве что filter и map.  
читать - https://rxjs.dev/guide/operators  

---

в ангуляре все хттп запросы тоже возвращают observable. и тут пригодятся операторы:   
switchmap(возможность выполнять запросы последовательно. этот способ предпочтительнее вложенных subscribe) и forkjoin(аналог promise.All)  

---

## Отписки:
Гербейдж коллектор не удаляет Subject'ы после destroy'ев компонентов - поэтому нужно отписываться:  
читать - https://tyapk.ru/blog/post/unsubscribe-from-observable (я использую takeUntil)  

---

вместо subject можно использовать behaviorsubject - это то же самое, но у него есть метод getValue() - который возвращает последнее значения которое было передано в него.  

## грязные трюки:

у хттп клиента есть метод toPromise() - можно использовать его когда хочется сделать await.  
можно делать так: (это типа кеш).   
```ts
globalFetch() {
    let _await = new Subject();

    if (this.slugs.getValue()) {
      setTimeout(() => {
        _await.next(true);
      }, 0)
      return _await
    }

    window.http.getData.subscribe((fetchData) => {
        this.slugs.next(fetchData)
        _await.next(true)
    });

    return _await;
}
```
и уже потом подписаться на globalFetch(). в первый раз мы сделаем ххтп запрос, а в последующие отдадим subscribe моментально.   

---

вообще это просто паттерн Observable - кстати он еще используется в api websocket'ах: делаем "next" на бекенде - слушаем "subscribe" на фронтенде
 
## extra:  
а что такое Promise?
    
Promise это фича js - все что происходит не сразу (например fetch()) возвращает promise. промис нужно дождаться те:  
  
1: использовать then (в этом случае код продолжить выполняться. а когда хттп запрос выполнится, выполнится наш каллбек в then) 
```js
let ddata = [];
fetch().then((data)=>{
    ddata = data;
    console.log('хттп запрос выполнен');
});
```
2: использовать await:
```js
let main = async () => {
    let data = await fetch();
}
```
тут весь скрипт зависнет и будет ждать хттп запрос.  
  
Промисы можно создавать самим; читать подробнее https://learn.javascript.ru/promise-basics

