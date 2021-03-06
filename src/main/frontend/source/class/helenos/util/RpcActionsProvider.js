/* ************************************************************************
Copyright:
  2012 Tomek Kuprowski
License:
  GPLv2: http://www.gnu.org/licences/gpl.html
Authors:
  Tomek Kuprowski (tomekkuprowski at gmail dot com)
 ************************************************************************ */
qx.Class.define('helenos.util.RpcActionsProvider', {
        
    statics : {
        
        _SCHEMA : '/Schema.json',
        _STANDARDQUERY : '/query/Standard.json',
        _SUPERQUERY : '/query/Super.json',
        
        dropKeyspace : function(keyspaceName) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            rpc.callSync('dropKeyspace', keyspaceName);
        },
        
        __findParamClass : function(className) {
            switch (className)
            {
                case 'org.apache.cassandra.db.marshal.BytesType':
                case 'org.apache.cassandra.db.marshal.AsciiType':
                case 'org.apache.cassandra.db.marshal.UTF8Type':
                    return 'java.lang.String';
                    break;
                case 'org.apache.cassandra.db.marshal.LongType':
                    return 'java.lang.Long';
                    break;
                case 'org.apache.cassandra.db.marshal.LexicalUUIDType':
                case 'org.apache.cassandra.db.marshal.TimeUUIDType':
                    return 'java.util.UUID';
                    break;
                default:
                    this.error('unknown class: ' + className);
                    return null;
                    break;
            }
        },
        
        describeClusterName : function() {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('describeClusterName');
        },
        
        describeKeyspace  : function(keyspaceName) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('describeKeyspace', keyspaceName);
        },
        
        describeKeyspaces  : function() {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('describeKeyspaces');
        },
        
        describeColumnFamily  : function(keyspaceName, columnFamily) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('describeColumnFamily', keyspaceName, columnFamily);
        },
        
        truncateColumnFamily  : function(keyspaceName, columnFamily) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('truncateColumnFamily', keyspaceName, columnFamily);
        },
        
        dropColumnFamily  : function(keyspaceName, columnFamily) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('dropColumnFamily', keyspaceName, columnFamily);
        },
        
        createColumnFamily  : function(formData) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('createColumnFamily', formData);
        },
        
        createKeyspace : function(formData) {
            var rpc = new helenos.util.Rpc(this._SCHEMA);
            return rpc.callSync('createKeyspace', formData);
        },
        
        querySingleColumn : function(cfDef, key, name, sName) {
            var query = {};
            
            query.keyClass = this.__findParamClass(cfDef.keyValidationClass);
            query.nameClass = this.__findParamClass(cfDef.comparatorType.className);
            query.keyspace = cfDef.keyspaceName;
            query.columnFamily = cfDef.name;
            query.key = key;
            query.name = name;
            
            var rpc = null;
            if (cfDef.columnType == 'Standard') {
                rpc = new helenos.util.Rpc(this._STANDARDQUERY);
            } else {
                rpc = new helenos.util.Rpc(this._SUPERQUERY);
                query.sNameClass = this.__findParamClass(cfDef.subComparatorType.className);
                query.sName = sName;
            }
            return rpc.callSync('singleColumn', query );
        },
        
        querySlice : function(cfDef, key, nameStart, nameEnd, sName, reversed ) {
            var query = {};
            
            query.keyClass = this.__findParamClass(cfDef.keyValidationClass);
            query.nameClass = this.__findParamClass(cfDef.comparatorType.className);
            query.keyspace = cfDef.keyspaceName;
            query.columnFamily = cfDef.name;
            query.key = key;
            query.nameStart = nameStart;
            query.nameEnd = nameEnd;
            query.reversed = reversed;
            
            var rpc = null;
            if (cfDef.columnType == 'Standard') {
                rpc = new helenos.util.Rpc(this._STANDARDQUERY);
            } else {
                rpc = new helenos.util.Rpc(this._SUPERQUERY);
                query.sNameClass = this.__findParamClass(cfDef.subComparatorType.className);
                query.sName = sName;
            }
            return rpc.callSync('slice', query );
        }
    }
});
