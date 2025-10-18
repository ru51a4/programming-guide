superxmlparser74.parse(str,
    (item) => {
        //opentag
        let el = new dom_node();
        el.attr = item.attr;
        el.tag = item.tag;
        if (parentStack[parentStack.length - 1] && el.tag !== 'script') {
            parentStack[parentStack.length - 1].childrens.push(el)
        }
        parentStack.push(el);
    },
    (item) => {
        //innertext
        if (parentStack[parentStack.length - 1]) {
            parentStack[parentStack.length - 1].innerTEXT += item.value;
        }
    },
    (item) => {
        //closedtag
        parentStack.pop();
    });
