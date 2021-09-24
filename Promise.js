
//自定义实现Promise
(function(window) {
    /**
     * Promise构造器 
     * executor 执行器函数(同步执行的)
     */

    //将常用的，固定的值，定义成常量
    const PENDING = 'pending'
    const RESOLVED = 'resolved'
    const REJECTED = 'rejected'

    //ES5使用构造函数，因为es5没有类的概念，
    // 用的是构造器，函数对象等来实现(一些ES5的语法)
    function Promise(executor) {
        const self = this//将当前promise对象保存起来,防止this变成window属性
        self.state = PENDING //给promise对象指定status属性，初始值为pending
        self.data = undefined // 给promise对象指定一个存储结果数据的属性
        self.callbacks = [] //每个元素的结构{onResolved(){,onRejected(){}}}

        function resolve(value) {
            //如果当前状态不是pending，直接结束
            if(self.state !== PENDING) {
                return
            }
            //将状态改为resolved
            self.state = RESOLVED
            //保存value数据
            self.data = value
            //如果有待执行callback函数，立即异步执行回调函数onResolved
            if(self.callbacks.length>0) {
                setTimeout(() => {//将onResolved回调放入异步函数setTimeout，使onResolved回调能加入事件队列中
                    self.callbacks.forEach(callbacksObj => {//执行所有的成功回调
                        callbacksObj.onResolved(value)//异步执行待执行的onResolved函数(说明提前已经被then函数调用过了)
                    })
                },0);
            }
        }

        function reject(reason) {
            //如果当前状态不是pending，直接结束
            if(self.state !== PENDING) {
                return
            }
            //将状态改为rejected
            self.state = REJECTED
            //保存reason数据
            self.data = reason
            if(self.callbacks.length>0) {
                setTimeout(() => {//将onRejected回调放入异步函数setTimeout，使onRejected回调能加入事件队列中
                    //如果有待执行callback函数，立即异步执行回调函数onRejected
                    self.callbacks.forEach(callbacksObj => {//执行所有的成功回调
                        callbacksObj.onRejected(reason)//异步执行待执行的onRejected函数
                        });
                },0);
            }
        }

        //立即同步执行器 executor
        try {
            executor(resolve,reject)
        } catch(error) {//如过执行器抛出异常，promise对象变为rejected状态
            reject(error)
        }
    }

    /**
     * promise原型对象方法
     * then回调函数:指定成功或失败的回调函数，并返回一个新promise对象
     * 
     * @param {*} onResolved  成功回调
     * @param {*} onRejected 失败回调
     */
    Promise.prototype.then = function(onResolved,onRejected) {

    //-----------------------------------------------为了巩固，老师带着重新写了一遍---第二遍p29集----------------------------------------------------

        // 指定回调函数的默认值，只要回调函数不是函数，默认指定一个函数。确保后续处理流程的成功
        onResolved = typeof onResolved === 'function' ? onResolved : val => val
        onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}//若失败回调不是函数，默认为一个失败回调函数
        
        const self = this
        // 返回新的promise对象
        return new Promise((resolve,reject) => {
            
            //封装失败或成功回调，根据回调函数的执行结果改变新promise的状态
            function process(callback) {
                    /**
                      * 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
                      * 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
                      * 3.如果回调函数返回的不是promise对象，return新的新promise就会成功，value就是返回的值
                      */
                try {
                    const res = callback(self.data)//根据传入的回调函数执行
                    if(res instanceof Promise) {//如果返回的是promise对象
                        res.then(resolve,reject)//新promise的状态就是现在promise的状态
                    } else {//返回的不是promise对象
                        resolve(res)
                    }
                    } catch (error) {
                        reject(error)//若回调函数抛出异常，新promise状态则为失败
                }
            }

            if(self.state===RESOLVED) {//resolve
                setTimeout(() => {//异步执行执行成功回调
                   process(onResolved)
                }, 0);

            }else if(self.state===REJECTED) {//rejected
                setTimeout(() => {//异步执行执行失败回调
                    process(onRejected)
                 }, 0)
            }else {//pending(这一块不是很理解)
                //将成功和失败的回调函数保存callbacks数组中缓存
                self.callbacks.push({
                    onResolved(value) {
                        process(onResolved)
                    },
                    onRejected(reason) {
                        process(onRejected)
                    }
                })
            }
        })
//--------------------------------------------------第二遍-----------------------------------------------------



//--------------------------------------------------第一遍-----------------------------------------------------

        // //(指定默认值)若onResolved不是函数，指定一个匿名函数
        // onResolved = typeof onResolved==='function' ? onResolved : value => value

        // //失败回调如果不是函数，则默认指定失败回调函数
        // onRejected = typeof onRejected==='function' ? onRejected : reason => {throw reason}

        // const _this = this
        // //返回新的promise对象
        // return new Promise((resolve,reject) => {
        //     /**
        //      * 调用指定回调函数处理，根据执行结果，改变return的promise状态
        //      * @param {*} callback //失败或成功的回调
        //      */
        //     function handle(callback) {//封装onResolved,onRejected回调，只需要写一次，不用分别为成功或失败回调各写一次实现
        //              /**
        //              * 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
        //              * 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
        //              * 3.如果回调函数返回的不是promise对象，return新的新promise就会成功，value就是返回的值
        //              */
        //           try {
        //             const result = callback(_this.data)
        //             if(result instanceof Promise) {
        //                 // 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
        //                 // result.then(val => resolve(val),
        //                 //             fail => reject(fail))
        //                 result.then(resolve,reject)//上两行的代码简洁化写法
        //             } else {
        //                 // 3.如果回调函数返回的不是promise对象，return的新promise就会成功，result就是返回的值
        //                 resolve(result)
        //             }
        //         } catch (error) {
        //             // 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
        //             reject(error)
        //         }
        //     }

        //     //当前状态还是pending状态，将回调函数保存起来
        //     if(_this.state === PENDING) {
        //         _this.callbacks.push({
        //             onResolved(value) {
        //                 handle(onResolved)
        //             },
        //             onRejected(reason) {
        //                 handle(onRejected)
        //             }
        //         })
        //     } else if(_this.state === RESOLVED) {//REJECTED和RESOLVE的实现基本没区别
        //         setTimeout(() => {//使用异步函数包裹回调函数，达到异步调用onResolved的结果
        //             handle(onResolved)//如果当前是resolved状态，异步执行onResolved并改变return的promise状态

        //             //  /**
        //             //  * 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
        //             //  * 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
        //             //  * 3.如果回调函数返回的不是promise对象，return新的新promise就会成功，value就是返回的值
        //             //  */
        //             //   try {
        //             //     const result = onResolved(_this.data)
        //             //     if(result instanceof Promise) {
        //             //         // 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
        //             //         // result.then(val => resolve(val),
        //             //         //             fail => reject(fail))
        //             //         result.then(resolve,reject)//上两行的简洁写法
        //             //     } else {
        //             //         // 3.如果回调函数返回的是非promise对象，return的新promise就会成功，result就是返回的值
        //             //         resolve(result)
        //             //     }
        //             // } catch (error) {
        //             //     // 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
        //             //     reject(error)
        //             // }
                    
        //         }, 0);
        //     } else { //Rejected
        //         setTimeout(() => {//使用异步函数包裹回调函数，达到异步调用onRejected的结果
        //             handle(onRejected)//如果当前是rejected状态，异步执行onRejected并改变return的promise状态

        //             // /**
        //             //  * 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
        //             //  * 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
        //             //  * 3.如果回调函数返回的不是promise对象，return新的新promise就会成功，value就是返回的值
        //             //  */
        //             // try {
        //             //     const result = onRejected(_this.data)
        //             //     if(result instanceof Promise) {
        //             //         // 2.如果回调函数返回的是promise，return的新promise状态就是回调函数返回的promise状态
        //             //         // result.then(val => resolve(val),
        //             //         //             fail => reject(fail))
        //             //         result.then(resolve,reject)//上两行的简洁写法
        //             //     } else {
        //             //         // 3.如果回调函数返回的是非promise对象，return的新promise就会成功，result就是返回的值
        //             //         resolve(result)
        //             //     }
        //             // } catch (error) {
        //             //     // 1.如果回调函数抛出异常，return的新promise状态就会失败，reason就是error
        //             //     reject(error)
        //             // }
                    
        //         }, 0);
        //     }
        // })
    }
//----------------------------------------------------第一遍----------------------------------------------------------------------------------

    /**
     * catch promise对象方法
     * @param {*} onReject 
     * 指定失败的回调函数，同时返回一个新的promise对象
     */
    Promise.prototype.catch = function(onRejected) {
        return this.then(undefined,onRejected)
    }

    /**
     * Promise函数对象的resolve方法
     * 返回一个指定的结果，同时返回一个新的promise对象
     */
    Promise.resolve = function(value) {
        return new Promise((resolve,reject) => {
            if(value instanceof Promise) {//如果value是promise对象
                value.then(resolve,reject)//根据当前promise对象(value)的状态返回新promise的状态
            } else {//非promise对象
                resolve(value)//直接返回成功状态的promise和value值
            }
        })
    }

    /**
     * Promise函数对象的reject方法
     * 返回一个reason结果，同时返回一个失败的promise对象
     */
    Promise.reject = function(reason) {
        //返回一个失败的promise
        return new Promise((resolve,reject) => {
                reject(reason)
        })
    }

    /**
     * Promise函数对象的all方法
     * 返回一个promise，只有当传入的所有promise都成功时才成功(返回一个数组结果),否则只要有一个失败，return的promise就失败
     */
    Promise.all = function(promises) {

        //计数器
        let resolveCount = 0
        //创建一个和promises一样长度的数组，用来保存所有成功的promise
        const returnValues = new Array(promises.length)
        //返回一个新promise对象
        return new Promise((resolve,reject) => {
        
            promises.forEach((p,index) => {
                // Promise.resolve(p),将p包裹后，如果p不是promise对象，也能确保return成功的promise
                Promise.resolve(p).then(
                    value => {
                        //成功数量加1
                        resolveCount++
                        // returnValues.push(p) 排列顺序不符合要求
                        //保存每个成功回调的promise结果值
                        returnValues[index] = value
                        if(resolveCount === promises.length) {
                            resolve(returnValues)//新promise的状态为成功
                        }
                    },
                    reason => {//只要有一个失败，return的promise就失败
                        reject(reason)
                    })
            }) 
        })
    }

    /**
     * Promise函数对象的race方法
     * 返回一个新promise，其状态由第一个完成的promise决定
     * promises参数:传入的promise对象数组
     */
    Promise.race = function(promises) {
        return new Promise((resolve,reject) => {
            promises.forEach((p,index) => {
                // Promise.resolve(p),将p包裹后，如果p不是promise对象，也能确保return成功的promise
                Promise.resolve(p).then(//哪个promise对象先执行完，return的promise状态就是它的状态
                    value => {
                        resolve(value)
                    },
                    fail => {
                        reject(fail)
                    }
                )
            })
        })
    } 
    window.Promise = Promise
})(window)