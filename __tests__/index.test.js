require('../setupTests');
const ReflowGrid = require('../dist/index').default;

const id = 'rg';
let reflow = null;

function createContainerWithFiveChildren() {
  document.body.innerHTML = `
  <div id="${id}" style="width: 500px;height:600px;">
    <div id="i1" style="height:200px;">Item 1</div>
    <div id="i2" style="height:100px;">Item 2</div>
    <div id="i3" style="height:300px;">Item 3</div>
    <div id="i4" style="height:150px;">Item 4</div>
    <div id="i5" style="height:250px;">Item 5</div>
  </div>`;
  const container = document.getElementById(id);
  if (container) {
    reflow = new ReflowGrid({ container, childrenWidthInPx: 100 });
  }
}

function createContainerWithNoChildren() {
  document.body.innerHTML = `<div id="${id}" style="width: 500px;height:600px;"></div>`;
  const container = document.getElementById(id);
  if (container) {
    reflow = new ReflowGrid({ container, childrenWidthInPx: 100 });
  }
}

describe('Reflow Grid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply correct transform properties', () => {
    createContainerWithFiveChildren();

    const item1 = document.getElementById('i1');
    const item2 = document.getElementById('i2');
    const item3 = document.getElementById('i3');
    const item4 = document.getElementById('i4');
    const item5 = document.getElementById('i5');

    expect(item1.style.transform).toBe('translate(0px, 0px)');
    expect(item2.style.transform).toBe('translate(100px, 0px)');
    expect(item3.style.transform).toBe('translate(200px, 0px)');
    expect(item4.style.transform).toBe('translate(300px, 0px)');
    expect(item5.style.transform).toBe('translate(100px, 100px)');
  });

  it('should change to the lower column', () => {
    createContainerWithFiveChildren();

    const item2 = document.getElementById('i2');
    item2.style.height = '180px';
    reflow.resize(500);
    const item5 = document.getElementById('i5');

    expect(item5.style.transform).toBe('translate(300px, 150px)');
  });

  it('should add classes to the DOM', () => {
    createContainerWithFiveChildren();

    expect(document.head.textContent).toContain('/* reflow grid */');
  });

  it('should get correct number of children', () => {
    createContainerWithFiveChildren();

    expect(reflow.children.length).toBe(5);
  });

  it('should not crash with 0 children', () => {
    createContainerWithNoChildren();

    expect(reflow.children.length).toBe(0);
  });

  it('should add class to container', () => {
    createContainerWithFiveChildren();

    const container = document.getElementById(id);
    expect(container.classList).toContain('rg-container');
  });

  it('should set new width to an element', () => {
    const element = document.createElement('div');
    element.style.width = '100px';
    expect(element.style.width).toBe('100px');

    ReflowGrid.setWidth(element, 200);
    expect(element.style.width).toBe('200px');
  });

  it('should track children height', () => {
    createContainerWithFiveChildren();

    const item1 = document.getElementById('i1');
    const item5 = document.getElementById('i5');

    expect(reflow.childLastId).toBe(5);

    expect(item1.getAttribute('data-rg-id')).toBe('1');
    expect(item5.getAttribute('data-rg-id')).toBe('5');

    expect(reflow.childrenHeights[1]).toBe(200);
    expect(reflow.childrenHeights[5]).toBe(250);
  });

  it('should return lower column index and height', () => {
    createContainerWithFiveChildren();

    const lower = reflow.getLowerColumn();
    expect(lower).toEqual({ index: 3, height: 150 });
  });

  it('should set new width to an element', () => {
    createContainerWithFiveChildren();

    const max = ReflowGrid.getMaxHeight([100, 200, 300, 50]);
    expect(max).toBe(300);
  });

  it.todo('should calculate margin');

  it.todo('should debounce');

  it.todo('should reflow');

  it.todo('should resize');

  it.todo('should throw errors on missing params');
});
