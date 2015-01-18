var _ = require("lodash");

var argument = require("./argument");
var command = require("./command");
var option = require("./option");
var utils = require("./utils");

var cli = function(opts, cb) {
  var options = opts || {};
  var name = options.name || utils.getProcessName(process.argv);
  var description = options.description || "";
  var flags = options.options || [];
  var commands = options.commands || [];
  var args = options.args || [];
  var action = typeof cb !== 'undefined' ? cb : null;
  return {
    getValue: function(cliArgs, cliOpts) {
      var parsedOptions = option.parseOptions(flags, cliOpts);

      if(utils.isValid(parsedOptions)) {
        var matchedCommand = _.find(commands, function(command) {
          return command.name === cliArgs[0];
        });

        if(matchedCommand) {
          var commandResult = matchedCommand.getValue(_.drop(cliArgs, 1), cliOpts, parsedOptions.success);
          if(utils.isError(commandResult)) {
            console.log(matchedCommand.helpText(name));
          }
        } else {
          var parsedArgs = argument.parseArgs(args, cliArgs);

          if(action !== null && utils.isValid(parsedArgs)) {
              action({
                args: parsedArgs.success,
                options: parsedOptions.success
              });
          } else {
            console.log(this.helpText);
          }
        }
      } else {
        console.log(this.helpText);
      }

    },
    helpText: function() {
      var optionsText = option.availableOptionsText(flags);
      var commandsText = command.availableCommandsText(commands);

      var output = name;
      if(description) output += ": " + description;
      output += '\n';
      if(!_.isEmpty(args)) output += "\nUsage : " + name + _.pluck(args, "helpText").join(' ');
      if(optionsText) output += '\n' + optionsText;
      if(optionsText && commandsText) output += '\n';
      if(commandsText) output += '\n' + commandsText;

      return output;
    }()
  };
};

module.exports = {
  cli: cli
};
