(function () {
  'use strict';

  angular
    .module('ngTableTree', [])
    .directive('tableTree', tableTree)
    .directive('ttTemplate', ttTemplate)
    .directive('ttClick', ttClick)
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

        // 由于 DOM 已经被编译过一次，所以暂时去掉所有的 ng-transclude，防止再次编译
        var result = startTemplate($scope, $scope.tableTree, ttTemplate.outerHTML.replace(/ng-transclude/g, ''));

        // 修复 ttTemplate 找不到外部 scope 的问题
        var myScope = $scope.$new(true);
        myScope = $scope.$parent;
        myScope.treeStatus = $scope.treeStatus;
        myScope.changeExpandStatus = $scope.changeExpandStatus;

        var result = $compile(result)(myScope);
        [].map.call(result.find('td'), function(td) {
          var tdLite = angular.element(td);
          if(tdLite.attr('tt-expand') !== undefined) {
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
        d._ttId = Math.random().toString();

        scope.treeStatus[d._ttId] = {
          parentId: parent ? parent._ttId : null,
          isExpandChildren: !!d._isExpandChildren,
          data: angular.extend({}, d, { 
            children: [], 
            childrenLength: (d.children || []).length 
          })
        };

        return template(scope, d, templateStr) + startTemplate(scope, d.children || [], templateStr, d);
      }).join('');
    }

    function template(scope, obj, templateStr) {
      var ttId = obj._ttId;
      var str = 'ng-show="';

      var tempObj = scope.treeStatus[ttId];
      var level = 0;
      while (tempObj.parentId) { // 添加是否显示属性
        level++;
        str += 'treeStatus[\'' + tempObj.parentId + '\'].isExpandChildren && ';
        tempObj = scope.treeStatus[tempObj.parentId];
      }

      str += 'true"';

      templateStr = templateStr.replace('tt-template', 'tt-template="treeStatus[' + ttId + '].data" ' + str);

      var str2 = 'ng-click="changeExpandStatus(' + ttId + ')"' + ' style="padding-left: ' + (level * 16) + 'px"';
      templateStr = templateStr.replace(/tt-expand/g, 'tt-expand ' + str2);

      var str3 = '{{ treeStatus[' + ttId + '].data.';
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) { // 添加字段属性
          var reg = new RegExp('\\u002A\\u0021' + key, 'g');
          templateStr = templateStr.replace(reg, str3 + key) // 将 *! 替换为 {{
            .replace(/\u0021\u002A/g, '}}'); // 将 !* 替换为 }}
        }
      }

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
  function ttClick($compile) {
    return {
      restrict: 'A',
      scope: {
        ttClick: '&'
      },
      require: '^ttTemplate',
      link: postLink
    };

    function postLink(scope, element, attr, ttTemplateCtrl) {
      element.on('click', function (event) {
        if (typeof scope.ttClick === 'function') {
          scope.$parent.$apply(function() {
            scope.ttClick({
              event: event,
              data: ttTemplateCtrl.getTtData()
            });
          });
        }
      });
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
        var isShowBlock = 'treeStatus[' + ttData._ttId + '].data.childrenLength > 0';
        var isShowExpand = 'treeStatus[' + ttData._ttId + '].isExpandChildren && ' + isShowBlock;
        
        wraper.append(angular.element('<ng-md-icon primary class="c-point" ng-show="!' + isShowExpand + '" icon="add_circle_outline" size="14"></ng-md-icon>'))
          .append(angular.element('<ng-md-icon primary class="c-point" ng-show="' + isShowExpand + '" icon="remove_circle_outline" size="14"></ng-md-icon>'))
          .append(angular.element('<ng-md-icon tip ng-hide="' + isShowBlock + '" icon="block" size="14"></ng-md-icon>'))
          .append(element.contents())
          .attr('layout', 'row')
          .attr('layout-align', 'start center');

        element.html('').append(wraper);
      }

    }
  }

})();
