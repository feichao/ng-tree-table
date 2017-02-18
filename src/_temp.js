(function () {
  'use strict';

  var originalTtTemplates = {};
  var TT_TEMPLATE_ID = 'tt-template-id';

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  };

  function getTreeObj(name, uuid) {
    return name + '[\'' + uuid + '\']';
  }

  function saveOriginalTtTemplate(element) {
    var uuid;
    var ttTemplate = findTtTemplate(element.find('tr'));
    if (ttTemplate) {
      uuid = generateUUID();
      originalTtTemplates[uuid] = ttTemplate;
    }

    return {
      ttTemplateId: uuid,
      ttTemplate: ttTemplate
    };
  }

  function findTtTemplate(trs) {
    var length = trs.length;
    for (var i = 0; i < length; i++) {
      var trEle = angular.element(trs[i]);
      if (trEle.attr('tt-template') !== undefined) {
        return trs[i];
      }
    }

    return undefined;
  }

  angular
    .module('myou.ui.tableTree', [])
    .directive('tableTree', tableTree)
    .directive('ttTemplate', ttTemplate)
    .directive('ttExpand', ttExpand);

  /**
   * @ngInject
   */
  function tableTree($compile) {
    return {
      restrict: 'A',
      scope: {
        tableTree: '='
      },
      template: function (element) {
        var result = saveOriginalTtTemplate(element);
        if (result.ttTemplateId) {
          element.attr(TT_TEMPLATE_ID, result.ttTemplateId);
          angular.element(result.ttTemplate).remove();
        }

        return element[0].outerHTML;
      },
      link: postLink
    };

    function postLink($scope, element, attr) {
      var tbody = element.find('tbody').eq(0);
      var ttTemplate = tbody.find('tr')[0];

      element.addClass('table-tree');

      $scope.treeStatus = {};

      $scope.changeExpandStatus = function (id) {
        $scope.treeStatus[id].isExpandChildren = !$scope.treeStatus[id].isExpandChildren;
      };

      $scope.$watch('tableTree', function () {
        if(!Array.isArray($scope.tableTree)) {
          tbody.html('<tr><td class="warning-msg">table tree needs array data</td></tr>');
          return;
        }

        if($scope.tableTree.length === 0) {
          tbody.html('<tr><td>No Items</td></tr>');
          return;
        }

        var ttOriginalTemplate = originalTtTemplates[element.attr(TT_TEMPLATE_ID)];
        var result = startTemplate($scope, $scope.tableTree, ttOriginalTemplate.outerHTML);

        // 修复 ttTemplate 找不到外部 scope 的问题
        var myScope = $scope.$new(true);
        myScope = $scope.$parent;
        myScope.treeStatus = $scope.treeStatus;
        myScope.changeExpandStatus = $scope.changeExpandStatus;

        var result = $compile(result)(myScope);
        [].map.call(result.find('td'), function (td) {
          var tdLite = angular.element(td);
          if (tdLite.attr('tt-expand') !== undefined) {
            var tdTemplate = $compile(tdLite.html())(myScope);
            tdLite.html('').append(tdTemplate);
          }
        });

        tbody.html('').append(result);
      });
    }

    function startTemplate(scope, datas, templateStr, parent) {
      return datas.map(function (d) {
        if (!d._ttId) {
          d._isExpandChildren = true;
        }
        d._ttId = generateUUID();

        scope.treeStatus[d._ttId] = {
          parentId: parent ? parent._ttId : null,
          isExpandChildren: !!d._isExpandChildren,
          data: angular.extend({}, d, {
            children: [],
            childrenLength: (d.children || []).length
          })
        };

        return template(scope, d, templateStr) + // tree's template
          startTemplate(scope, d.children || [], templateStr, d); // tree's children's template
      }).join('');
    }

    function template(scope, obj, templateStr) {
      var ttId = obj._ttId;
      var str = 'ng-show="';

      var rowData = scope.treeStatus[ttId];
      var level = 0;
      while (rowData.parentId) { // 添加是否显示属性
        level++;
        str += getTreeObj('treeStatus', rowData.parentId) + '.isExpandChildren && ';
        rowData = scope.treeStatus[rowData.parentId];
      }

      str += 'true"';

      templateStr = templateStr.replace('tt-template', 'tt-template="' + getTreeObj('treeStatus', ttId) + '.data" ' + str);

      var str2 = 'ng-click="changeExpandStatus(\'' + ttId + '\')"' + ' style="padding-left: ' + (level * 12 + 8) + 'px"';
      templateStr = templateStr.replace(/tt-expand/g, 'tt-expand ' + str2);

      var str3 = getTreeObj('treeStatus', ttId) + '.data';
      templateStr = templateStr.replace(/\*\*/g, str3);
      return templateStr;
    }
  }

  /**
   * @ngInject
   */
  function ttTemplate($compile) {
    return {
      restrict: 'A',
      scope: {
        ttTemplate: '='
      },
      link: postLink,
      controller: ttTemplateCtrl
    };

    function postLink(scope, tElement, tAttr) {
    }

    /**
     * @ngInject
     */
    function ttTemplateCtrl($scope) {
      this.getTtData = function () {
        return $scope.ttTemplate;
      };
    }
  }

  /**
   * @ngInject
   */
  function ttExpand() {
    return {
      restrict: 'A',
      require: '^ttTemplate',
      link: postLink
      // priority: 100
    };

    function postLink(scope, element, attr, ttTemplateCtrl) {

      var wraper = angular.element('<div></div>');

      var ttData = ttTemplateCtrl.getTtData();

      if (ttData) {
        var isShowBlock = getTreeObj('treeStatus', ttData._ttId) + '.data.childrenLength > 0';
        var isShowExpand = getTreeObj('treeStatus', ttData._ttId) + '.isExpandChildren && ' + isShowBlock;

        wraper.append(angular.element('<ng-md-icon tip class="c-point" ng-show="!' + isShowExpand + '" icon="keyboard_arrow_right" size="24"></ng-md-icon>'))
          .append(angular.element('<ng-md-icon tip class="c-point" ng-show="' + isShowExpand + '" icon="keyboard_arrow_down" size="24"></ng-md-icon>'))
          .append(angular.element('<ng-md-icon tip class="expand-leaf" ng-hide="' + isShowBlock + '" icon="block" size="24"></ng-md-icon>'))
          .append(element.contents())
          .attr('layout', 'row')
          .attr('layout-align', 'start center');

        element.html('').append(wraper);
      }

    }
  }

})();
