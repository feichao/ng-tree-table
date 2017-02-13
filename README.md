## 世界上最好用的基于 Angular 和 Angular Material 的树形表格组件

【DEMO is coming...】

看到很多基于 angular material 的 table-tree 组件，都需要在 JS 文件中定义表格的列属性，麻烦不说，而且 HTML 属性定义在 JS 中，始终不方便维护，代码也很丑陋。

ngTableTree 定义了一个 tableTree 指令，在指令内部使用  $compile 重新编译需要显示的 HTML 模板文件，所以我们可以直接在 HTML 中定义模板。

比如：
```
<table table-tree="tree">
  <thead>
    <tr>
      <th>耗时</th>
      <th>耗时百分比</th>
      <th>调用栈</th>
      <th>时间戳</th>
      <th>应用</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr tt-template>
      <td>*!duration!*</td>
      <td>
        <div layout="row" layout-align="start center">
          <md-progress-linear md-mode="determinate" value="*!progress!*"></md-progress-linear>
          <span>*!progress.toFixed(2)!*%</span>
        </div>
      </td>
      <td tt-expand class="long-text">*!name!*</td>
      <td>*!timestamp!*</td>
      <td>*!id!*</td>
      <td>
        <md-button tt-click="vm.testClick(event, data);" class="md-raised md-primary">删除</md-button>
      </td>
    </tr>
  </tbody>
</table>
```

然后在 controller 中定义：
```
$scope.tree = [{
  'children': [{
    'children': [{
      'children': [{
        'children': [{
          'duration': 5005507,
          'id': '22259474470f92c8',
          'name': 'jedis-normal',
          'parentId': '49251ba0bbeb7c23',
          'progress': 94.0178,
          'timestamp': '1486522925570000',
          'traceId': 'fa81ae5e7b6f877f',
          'children': [{
            'duration': 5005507,
            'id': '22259474470f92c8',
            'name': 'jedis-normal',
            'parentId': '49251ba0bbeb7c23',
            'progress': 94.0178,
            'timestamp': '1486522925570000',
            'traceId': 'fa81ae5e7b6f877f',
            'children': [{
              'duration': 5005507,
              'id': '22259474470f92c8',
              'name': 'jedis-normal',
              'parentId': '49251ba0bbeb7c23',
              'progress': 94.0178,
              'timestamp': '1486522925570000',
              'traceId': 'fa81ae5e7b6f877f'
            }],
          }],
        }],
        'duration': 5009120,
        'id': '49251ba0bbeb7c23',
        'name': 'get_/jedis-normal',
        'parentId': '6dd5d2bf9041a5eb',
        'progress': 94.08567,
        'timestamp': '1486522925569000',
        'traceId': 'fa81ae5e7b6f877f'
      }],
      'duration': 5011852,
      'id': '6dd5d2bf9041a5eb',
      'name': 'callme1',
      'parentId': '784097037f85455d',
      'progress': 94.136986,
      'timestamp': '1486522925566000',
      'traceId': 'fa81ae5e7b6f877f'
    }, {
      'children': [{
        'duration': 105346,
        'id': 'cfc2ccdf81b3a08f',
        'name': 'callme5',
        'parentId': '4fd8c962cec839dc',
        'progress': 1.9787006,
        'timestamp': '1486522930579000',
        'traceId': 'fa81ae5e7b6f877f'
      }],
      'duration': 309145,
      'id': '4fd8c962cec839dc',
      'name': 'callme2',
      'parentId': '784097037f85455d',
      'progress': 5.8066316,
      'timestamp': '1486522930578000',
      'traceId': 'fa81ae5e7b6f877f'
    }],
    'duration': 5322414,
    'id': '784097037f85455d',
    'name': 'callme0',
    'parentId': 'e038b25ba938a1a2',
    'progress': 99.97023,
    'timestamp': '1486522925566000',
    'traceId': 'fa81ae5e7b6f877f'
  }],
  'duration': 5323999,
  'id': 'e038b25ba938a1a2',
  'name': 'get_/testdapper',
  'progress': 100.0,
  'timestamp': '1486522925565000',
  'traceId': 'fa81ae5e7b6f877f'
}];
```

通过上面的例子可以看出我们总共定义了几个指令：

 - table-tree：关联要绑定的数据
 - tt-template：行数据模板，其中的行属性字段使用 \*!...!\* 包含，比如行数据的 duration 字段表示为 \*!duration!\*
 - tt-expand：放到 td 中，说明点击这个 td 可以展开或收起树
 - tt-click：关联任何元素上的 click 事件




