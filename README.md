## 世界上最好用的基于 Angular 和 Angular Material 的树形表格组件

[Demo][1]

看到很多基于 angular material 的 table-tree 组件，都需要在 JS 文件中定义表格的列属性，麻烦不说，而且 HTML 属性定义在 JS 中，始终不方便维护，代码也很丑陋。

ngTableTree 定义了一个 tableTree 指令，在指令内部使用  $compile 重新编译需要显示的 HTML 模板文件，所以我们可以直接在 HTML 中定义模板。

#### 比如：
```
<table table-tree="tree" init-expand="true" expand-indent="10">
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
      <th>Address</th>
      <th>Contact</th>
    </tr>
  </thead>
  <tbody>
    <tr tt-template>
      <td tt-expand>{{ **.name }}</td>
      <td>{{ **.age }}</td>
      <td>{{ **.address }}</td>
      <td>
        {{ **.contact }}
        <ng-md-icon icon="info" style="fill: #ccc; vertical-align: middle;" size="16">
          <md-tooltip>please contact me with {{ **.contact }}</md-tooltip>
        </ng-md-icon>
      </td>
    </tr>
  </tbody>
</table>
```

然后在 controller 中定义：
```
$scope.tree = [{
  name: 'frank',
  age: 34,
  address: 'Kezhu Road 192',
  contact: '13600010001',
  children: [{
    name: 'frank a',
    age: 34,
    address: 'Kezhu Road 192',
    contact: '13600010002'
  }, {
    name: 'frank b',
    age: 34,
    address: 'Kezhu Road 192',
    contact: '13600010003',
    children: [{
      name: 'frank ba',
      age: 34,
      address: 'Kezhu Road 192',
      contact: '13600010004'
    }, {
      name: 'frank bb',
      age: 34,
      address: 'Kezhu Road 192',
      contact: '13600010005'
    }, {
      name: 'frank bc',
      age: 34,
      address: 'Kezhu Road 192',
      contact: '13600010006'
    }]
  }, {
    name: 'frank c',
    age: 34,
    address: 'Kezhu Road 192',
    contact: '13600010003'
  }]
}, {
  name: 'frank d',
  age: 34,
  address: 'Kezhu Road 192',
  contact: '13600010007'
}];
```

#### 使用
如上述例子，在需要使用 table tree 的地方加入 table-tree 指令，并且关联要绑定的数据。

#### 参数说明：
 - table-tree：关联要绑定的数据
 - init-expand：初始化时的默认展开说明，默认展开
 - expand-indent：层级缩进，默认为 10px

### 注意：
- 绑定的数据下一级数据使用 children 属性指定。
- 如果要指定行数据模板，请在定义 tr 时加入 tt-template 属性，否则以第一个 tr 行为模板
    ```
    <tbody>
      <tr tt-template>...</tr>
    </tbody>
    ```
    其中的行属性字段使用 {{ \*\* }} 指代，比如行数据的 name 字段表示为 {{ \*\*.name }}

- 如果要指定哪个单元格控制展开收起动作，请使用 tt-expand 属性，否则以行数据模板的第一个 td 为默认控制行展开收起的单元格：
    ```
    <td tt-expand>{{ **.name }}</td>
    ```


  [1]: http://www.0xfc.cn/article/0/58a9422a2c2ff13a2ae3752c