/* ************************************************************************
Copyright:
  2012 Tomek Kuprowski
License:
  GPLv2: http://www.gnu.org/licences/gpl.html
Authors:
  Tomek Kuprowski (tomekkuprowski at gmail dot com)
 ************************************************************************ */
/*
#asset(qx/icon/${qx.icontheme}/16/actions/system-search.png)
#asset(qx/icon/${qx.icontheme}/16/places/folder-open.png)
*/
qx.Class.define("helenos.components.tab.browse.AbstractBrowsePage",
{
    extend : helenos.components.tab.AbstractCloseablePage,
    
    construct : function(ksName, cfName)
    {;
        this.base(arguments);
        this._manager = new qx.ui.form.validation.Manager();
        this._ksName = ksName;
        this._cfName = cfName;
        this._cfDef = helenos.util.RpcActionsProvider.describeColumnFamily(this._ksName, this._cfName);
        
        this.set({
            layout : new qx.ui.layout.VBox(3, 'top'),
            label: (ksName + ' : ' + cfName)
        });
        
        this._resultView = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        this._rajCB = new qx.ui.form.CheckBox('Parse results to JSON');
        
        this.add(this._getCriteriaPane());
        this.add(this.__getSearchActionPane());
        this.add(this._resultView, {flex: 1});
    },
 
    members : {
        _ksName : null,
        _cfName : null,
        _cfDef : null,
        
        _resultView : null,
        _manager : null,
        
        _rajCB : null,
        
        __getSearchActionPane : function() {
            var pane = new qx.ui.container.Composite(new qx.ui.layout.HBox(3, 'left'));
            pane.add(this._getSearchButton());
            pane.add(this._rajCB);
            
            return pane;
        },
        
        _getCriteriaPane : function() {
            var components = this._getCriteriaComponents();
            
            var criteriaGB = new qx.ui.groupbox.GroupBox('Criteria');
            criteriaGB.setLayout(new qx.ui.layout.HBox(8).set({alignY : 'middle'}));
            for (var i = 0; i < components.length; i++) {
                criteriaGB.add(components[i]);
                criteriaGB.add(new qx.ui.core.Spacer(3));
            }
            
            return criteriaGB;
        },
        
        _getTreeFromJson : function(name, data) {
            var tree = new qx.ui.tree.Tree();
            var rootNode = new qx.ui.tree.TreeFolder(name).set({open:true});
            tree.setRoot(rootNode);
          
            if (data == undefined || data == '') {
                tree.getRoot().add(new qx.ui.tree.TreeFile('empty value'));
                return tree;
            }
            
            this._renderTreeItemFromJson(tree.getRoot(), qx.lang.Json.parse(data));
            return tree;
        },
        
        _performSearch : function() {
            throw new Error('_performSearch is abstract');
        },
        
        _getCriteriaComponents : function() {
            throw new Error('_getCriteriaComponents is abstract');
        },

        _getSearchButton : function() {
            var button = new qx.ui.form.Button('Search', 'icon/16/actions/system-search.png');
            button.addListener("execute", this._performValidation, this);
            return button;
        },
        
        _performValidation : function(e) {
            this._manager.validate();
            if (this._manager.isValid()) {
                this._performSearch();
            }
        },
        
        _renderTreeItemFromJson : function(node, data) {
            if (data == null) {
                return;
            }
            if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    this._renderTreeItemFromJson(node, data[i]);
                }
            } else if(typeof data === 'object') {
                for (var key in data) {
                    var subNode = null;
                    if(Array.isArray(data[key])) {
                        subNode = new qx.ui.tree.TreeFolder(key);
                        subNode.set({icon : 'helenos/a.png', open : true});
                        this._renderTreeItemFromJson(subNode, data[key]);
                    } else
                    if (typeof data[key] === 'number') {
                        subNode = new qx.ui.tree.TreeFile(key + ' : ' + data[key]);
                        subNode.setIcon('helenos/n.png');
                    } else
                    if (typeof data[key] === 'string') {
                        subNode = new qx.ui.tree.TreeFile(key + ' : ' + data[key]);
                        subNode.setIcon('helenos/s.png');
                    } else
                    if (typeof data[key] === 'boolean') {
                        subNode = new qx.ui.tree.TreeFile(key + ' : ' + data[key]);
                        subNode.setIcon('helenos/b.png');
                    }
                    else {
                        subNode = new qx.ui.tree.TreeFolder(key);
                        subNode.set({icon : 'icon/16/places/folder-open.png', open : true});
                        this._renderTreeItemFromJson(subNode, data[key]);
                    }
                    node.add(subNode);
                }
            } else {
               node.add(new qx.ui.tree.TreeFile(data));
            }
        }
    }
});
