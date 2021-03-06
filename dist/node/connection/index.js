'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request = require('../request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HEADER_BLACKLIST = ['content-type'];

var Connection = function () {
    function Connection(path) {
        var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Connection);

        this.path = path;
        this.headers = _extends({}, headers);

        Object.keys(headers).forEach(function (header) {
            if (HEADER_BLACKLIST.includes(header.toLowerCase())) {
                throw new Error('Header ' + header + ' is reserved and cannot be set.');
            }
        });
    }

    _createClass(Connection, [{
        key: 'getApiUrls',
        value: function getApiUrls(endpoint) {
            return this.path + {
                'blocks': 'blocks',
                'blocksDetail': 'blocks/%(blockId)s',
                'outputs': 'outputs',
                'statuses': 'statuses',
                'transactions': 'transactions',
                'transactionsDetail': 'transactions/%(transactionId)s',
                'assets': 'assets',
                'votes': 'votes'
            }[endpoint];
        }
    }, {
        key: '_req',
        value: function _req(path) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            // NOTE: `options.headers` could be undefined, but that's OK.
            options.headers = _extends({}, options.headers, this.headers);
            return (0, _request2.default)(path, options);
        }

        /**
         * @public
         * @param blockId
         */

    }, {
        key: 'getBlock',
        value: function getBlock(blockId) {
            return this._req(this.getApiUrls('blocksDetail'), {
                urlTemplateSpec: {
                    blockId: blockId
                }
            });
        }

        /**
         * @public
         * @param transactionId
         */

    }, {
        key: 'getStatus',
        value: function getStatus(transactionId) {
            return this._req(this.getApiUrls('statuses'), {
                query: {
                    transaction_id: transactionId
                }
            });
        }

        /**
         * @public
         * @param transactionId
         */

    }, {
        key: 'getTransaction',
        value: function getTransaction(transactionId) {
            return this._req(this.getApiUrls('transactionsDetail'), {
                urlTemplateSpec: {
                    transactionId: transactionId
                }
            });
        }

        /**
         * @public
         * @param transactionId
         * @param status
         */

    }, {
        key: 'listBlocks',
        value: function listBlocks(transactionId, status) {
            return this._req(this.getApiUrls('blocks'), {
                query: {
                    transaction_id: transactionId,
                    status: status
                }
            });
        }

        /**
         * @public
         * @param publicKey
         * @param spent
         * @param onlyJsonResponse
         */

    }, {
        key: 'listOutputs',
        value: function listOutputs(publicKey, spent) {
            var onlyJsonResponse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var query = {
                public_key: publicKey
                // NOTE: If `spent` is not defined, it must not be included in the
                // query parameters.
            };if (spent !== undefined) {
                query.spent = spent.toString();
            }
            return this._req(this.getApiUrls('outputs'), {
                query: query
            }, onlyJsonResponse);
        }

        /**
         * @public
         * @param assetId
         * @param operation
         */

    }, {
        key: 'listTransactions',
        value: function listTransactions(assetId, operation) {
            return this._req(this.getApiUrls('transactions'), {
                query: {
                    asset_id: assetId,
                    operation: operation
                }
            });
        }

        /**
         * @public
         * @param blockId
         */

    }, {
        key: 'listVotes',
        value: function listVotes(blockId) {
            return this._req(this.getApiUrls('votes'), {
                query: {
                    block_id: blockId
                }
            });
        }

        /**
         * @public
         * @param txId
         * @return {Promise}
         */

    }, {
        key: 'pollStatusAndFetchTransaction',
        value: function pollStatusAndFetchTransaction(txId) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var timer = setInterval(function () {
                    _this.getStatus(txId).then(function (res) {
                        if (res.status === 'valid') {
                            clearInterval(timer);
                            _this.getTransaction(txId).then(function (res_) {
                                resolve(res_);
                            });
                        }
                    }).catch(function (err) {
                        clearInterval(timer);
                        reject(err);
                    });
                }, 500);
            });
        }

        /**
         * @public
         *
         * @param transaction
         */

    }, {
        key: 'postTransaction',
        value: function postTransaction(transaction) {
            return this._req(this.getApiUrls('transactions'), {
                method: 'POST',
                jsonBody: transaction
            });
        }

        /**
         * @public
         *
         * @param search
         */

    }, {
        key: 'searchAssets',
        value: function searchAssets(search) {
            return this._req(this.getApiUrls('assets'), {
                query: {
                    search: search
                }
            });
        }
    }]);

    return Connection;
}();

exports.default = Connection;
module.exports = exports['default'];