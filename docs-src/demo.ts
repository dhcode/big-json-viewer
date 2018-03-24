import {BigJsonViewerDom, JsonNodeElement} from '../src';

const demoData = {
  simpleData: {
    element1: 'str',
    element2: 1234,
    element3: [
      23,
      43,
      true,
      false,
      null,
      {name: 'special'},
      {},
    ],
    element4: [],
    element5: 'this should be some long text\nwith line break',
    element6: {
      name: 'Hero',
      age: 32,
      birthday: {year: 1986, month: 4, day: 30}
    }
  },
  largeData: (function () {
    const list = new Array(Math.floor(Math.random() * 1000));
    for (let i = 0; i < list.length; i++) {
      list[i] = Math.random();
      if (list[i] < 0.2) {
        list[i] = 'hey ' + list[i];
      }
      if (list[i] > 0.8) {
        list[i] = {};
        const entries = Math.floor(Math.random() * 1000);
        for (let j = 0; j < entries; j++) {
          list[i]['entry-' + j] = Math.random();
        }
      }
    }
    return list;
  }())
};


const codeElement = document.getElementById('code') as HTMLTextAreaElement;
const viewerElement = document.getElementById('viewer') as HTMLDivElement;
const pathsElement = document.getElementById('paths') as HTMLTextAreaElement;
const copiedElement = document.getElementById('copied') as HTMLInputElement;
const searchElement = document.getElementById('search') as HTMLInputElement;
const searchInfoElement = document.getElementById('searchInfo') as HTMLSpanElement;
let rootNode = document.getElementById('rootNode') as JsonNodeElement;


querySelectorArray('[data-load]').forEach((link: any) => {
  const load = link.getAttribute('data-load');
  if (demoData[load] && !link.loadListener) {
    link.loadListener = true;
    link.addEventListener('click', e => {
      e.preventDefault();
      loadStructureData(demoData[load]);
    });
  }
});

codeElement.addEventListener('input', e => {
  console.log('show data based on input');
  showData(codeElement.value);
});
searchElement.addEventListener('input', async e => {
  rootNode.closeNode();
  if (searchElement.value.length >= 2) {
    const cursor = await rootNode.openBySearch(new RegExp(searchElement.value, 'i'));
    searchInfoElement.textContent = cursor.matches.length + ' matches';

    searchInfoElement.appendChild(document.createTextNode(' '));

    const prevBtn = searchInfoElement.appendChild(document.createElement('a'));
    prevBtn.href = 'javascript:';
    prevBtn.addEventListener('click', e => {
      e.preventDefault();
      cursor.previous();
    });
    prevBtn.textContent = 'Prev';

    searchInfoElement.appendChild(document.createTextNode(' '));

    const nextBtn = searchInfoElement.appendChild(document.createElement('a'));
    nextBtn.href = 'javascript:';
    nextBtn.addEventListener('click', e => {
      e.preventDefault();
      cursor.next();
    });
    nextBtn.textContent = 'Next';
  } else {
    rootNode.openBySearch(null);
    searchInfoElement.textContent = '';
  }

});


loadStructureData(demoData.simpleData);

function loadStructureData(structure) {
  const text = JSON.stringify(structure, null, 2);
  codeElement.value = text;
  showData(text);
  showPaths();
}

async function showData(data: string) {
  if (viewerElement.children.length) {
    viewerElement.removeChild(viewerElement.children[0]);
  }
  try {
    const viewer = await BigJsonViewerDom.fromData(data);
    rootNode = viewer.getRootElement();
    rootNode.id = 'rootNode';
    viewerElement.appendChild(rootNode);
    rootNode.openAll(1);
    setupRootNode();

  } catch (e) {
    console.error('BigJsonViewer error', e);
    const errEl = document.createElement('div');
    errEl.classList.add('alert', 'alert-danger');
    errEl.appendChild(document.createTextNode(e.toString()));
    viewerElement.appendChild(errEl);
  }

}

function setupRootNode() {
  const listener = e => {
    console.log('event', e.type);
    showPaths();
  };
  rootNode.addEventListener('openNode', listener);
  rootNode.addEventListener('closeNode', listener);
  rootNode.addEventListener('openedNodes', listener);
  rootNode.addEventListener('openStub', listener);
  rootNode.addEventListener('closeStub', listener);
  rootNode.addEventListener('copyPath', e => {
    const node = e.target as JsonNodeElement;
    copiedElement.value = node.jsonNode.path.join('.');
  });
}

function showPaths() {
  if (!rootNode || !rootNode.getOpenPaths) {
    return;
  }

  pathsElement.value = rootNode.getOpenPaths().map(path => path.join('.')).join('\n');

}

function querySelectorArray(selector: string) {
  const list = document.querySelectorAll(selector);
  const result = [];
  for (let i = 0; i < list.length; i++) {
    result.push(list[i]);
  }
  return result;
}
