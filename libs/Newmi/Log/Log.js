/**
* @class NeWMI.Log
* <p>Provides services to log, such as writing exceptions, encapsulating your code in protected scope</p>
* @static
*/
define(["dojo/_base/declare"], function (declare) {
    var Log = declare("NeWMI.Log", null, { });

    /**
	* @method message
    * Writing the message and the exception as an simple message
    *
	* @param {String} p_strMessage The message to write
	* @param {Error} [e] the error
    * @static
	*/
    Log.message = function (p_strMessage, e) {
        console.log(p_strMessage + "\n" + Log._getStack(e));
    }

    /**
	* @method error
    * Writing the message and the exception as an error message
    *
	* @param {String} p_strMessage The error message to write
	* @param {Error} [e] the error
    * @static
	*/
    Log.error = function (p_strMessage, e) {
        console.error(p_strMessage + "\n" + Log._getStack(e));
    }

    /**
	* @method warn
    * Writing the message and the exception as an warning message
    *
	* @param {String} p_strMessage The warning message to write
	* @param {Error} [e] the error
    * @static
	*/
    Log.warn = function (p_strMessage, e)
    {
        console.warn(p_strMessage + "\n" + Log._getStack(e));
    }

    Log._getStack = function (p_objE) {
        var stacktarce;
        var intLinesToRemove = 1;

        if (p_objE && p_objE.stack)
            stacktarce = p_objE.stack;
        else {
            try {
                this.justThrowException();
            }
            catch (ex) {
                intLinesToRemove = 3;
                stacktarce = ex.stack;
            }
        }

        var objLines = stacktarce.split('\n');
        objLines.splice(0, intLinesToRemove);
        stacktarce = objLines.join('\n');
        
        return stacktarce;
    }

    /**
   * @method tc
   * Encapsulating your function code in try catch area, with handling exception
   *
   * @param {Object} scope The scope of the code
   * @param {Function} Function calling your code
   * @static
   */
    Log.tc = function (scope, code) {
        try {
            code.call(scope);
        }
        catch (ex) {
            Log.error(ex.message, ex);
        }
    }

    return Log;
});