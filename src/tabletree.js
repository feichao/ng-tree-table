(function () {
  'use strict';

  var SCOPE_HINT = '\\*\\*';
  var EXPAND_INTENT = 10; // 'px'
  var DEBUG = true;

  function log(msg) {
    if(DEBUG) {
      console.log(msg);
    }
  }

  function findMatchAttrTemplate(elements, attr) {
    var length = elements.length;
    for (var i = 0; i < length; i++) {
      var trEle = angular.element(elements[i]);
      if (trEle.attr(attr) !== undefined) {
        return elements[i];
      }
    }
    return elements[0];
  }

  function findTtTemplate(trs) {
    return findMatchAttrTemplate(trs, 'tt-template');
  }

  function findTdExpand(tds) {
    return findMatchAttrTemplate(tds, 'tt-expand');
  }

  function getJqliteHtml(element) {
    if (element instanceof angular.element) {
      return element[0].outerHTML;
    }
  }

  function getArray(array) {
    return Array.isArray(array) ? array : [];
  }

  angular
    .module('ngTableTree', [])
    .directive('tableTree', tableTree);

  /**
   * @ngInject
   */
  function tableTree($compile, $interpolate) {
    return {
      restrict: 'A',
      scope: {
        tableTree: '=',
        initExpand: '@',
        expandIndent: '@'
      },
      priority: 1001,
      terminal: true,
      compile: compile
    };

    function compile(tElement, tAttr) {
      var thNum = tElement.find('thead').find('th').length;
      var tbody = tElement.addClass('tt-table').find('tbody');
      var ttTemplateDom = findTtTemplate(tbody.find('tr'));

      tbody.html('');

      return function ($scope, element, attr) {
        log('start post link');
        var ttTemplateElement = angular.element(ttTemplateDom);
        var templateStr = getTreeTemplate();
        var treesCompileScope;

        // 保存状态
        $scope.trees = [];
        $scope.toggleExpand = function (index) {
          $scope.trees[index].__$isExpand = !$scope.trees[index].__$isExpand;
        };
        $scope.isTrShow = function (index) {
          var i = $scope.trees[index].__$parentIndex;
          while(typeof i === 'number' && i >= 0) {
            if(!$scope.trees[i].__$isExpand) {
              return false;
            }
            i = $scope.trees[i].__$parentIndex;
          }
          return true;
        };
        $scope.getTrDepth = function (index) {
          var i = $scope.trees[index].__$parentIndex;
          var depth = 0;
          while(typeof i === 'number' && i >= 0) {
            depth++;
            i = $scope.trees[i].__$parentIndex;
          }
          return depth;
        };

        $scope.$watch('tableTree', function () {
          $scope.trees = [];
          $scope.indent = angular.isDefined($scope.expandIndent) ? $scope.expandIndent : EXPAND_INTENT;
          $scope.initExpand = angular.fromJson($scope.initExpand);

          getTreeStatus(null, getArray($scope.tableTree));
          log($scope.trees);
          if (!$scope.trees.length) {
            return tbody.html('<tr><td colspan="' + thNum + '">No Items</td></tr>');
          }

          if(treesCompileScope) {
            treesCompileScope.$destroy();
          }

          treesCompileScope = getNewScope();
          var compileStr = $compile(templateStr)(treesCompileScope);
          var templateElement = angular.element(compileStr);
          tbody.html('').append(templateElement);
        });

        function getNewScope() {
          var scope = $scope.$parent.$new();
          for(var key in $scope) {
            if($scope.hasOwnProperty(key) && key.charAt(0) !== '$') {
              scope[key] = $scope[key];
            }
          }
          return scope;
        }

        function saveBranchBlock(parentIndex, branch) {
          var index = $scope.trees.length;
          $scope.trees.push(angular.extend({
            __$index: index,
            __$parentIndex: parentIndex,
            __$isExpand: $scope.initExpand,
          }, branch));

          return index;
        }

        function getTreeStatus(parentId, children) {
          var length = children.length;
          var branch;
          var branchIndex;
          var result = '';
          for (var i = 0; i < length; i++) {
            branch = children[i];
            branchIndex = saveBranchBlock(parentId, branch);
            getTreeStatus(branchIndex, getArray(branch.children));
          }
        }

        function getTreeTemplate() {
          var ttTemplateStr;

          ttTemplateElement.attr('ng-repeat', 'tree in trees')
            .attr('ng-show', 'isTrShow(tree.__$index)');

          var tdExpandElement = findTdExpand(ttTemplateElement.find('td'));
          var tdExpandJQElement = angular.element(tdExpandElement);
          tdExpandJQElement.html(getJqliteHtml(getExpandTemplate(tdExpandJQElement)));

          ttTemplateStr = getJqliteHtml(ttTemplateElement).replace(/\*\*/g, 'tree');
          log(ttTemplateStr);

          return ttTemplateStr;
        }

        function getExpandTemplate(tdElement) {
          var isShow =  'tree.children.length > 0';
          var isExpand = 'tree.__$isExpand && ' + isShow;
          var icon = isExpand + ' ? \'keyboard_arrow_down\' : \'keyboard_arrow_right\'';
          var expandIcon = angular.element('<ng-md-icon size="24"></ng-md-icon>')
          expandIcon.attr('icon', '{{' + icon + '}}')
            .attr('ng-style', '{ visibility: ' + isShow + ' ? \'\' : \'collapse\', marginLeft: getTrDepth(tree.__$index) * indent + \'px\'}')
            .attr('ng-click', 'toggleExpand(tree.__$index)')
            .addClass('expand-icon');

          return angular.element('<div></div>')
            .append(expandIcon)
            .append(tdElement.addClass('tt-expand-td').contents())
            .attr('layout', 'row')
            .attr('layout-align', 'start center');
        }
      };
    }
  }
})();
