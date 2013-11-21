(function() {
Ember.EasyForm = Ember.Namespace.create({
  VERSION: '1.0.0.beta.1'
});

})();



(function() {
Ember.EasyForm.Config = Ember.Namespace.create({
  _wrappers: {
    'default': {
      formClass: '',
      fieldErrorClass: 'fieldWithErrors',
      inputClass: 'input',
      inputElementClass: '',
      errorClass: 'error',
      hintClass: 'hint',
      labelClass: '',
      wrapControls: false,
      controlsWrapperClass: ''
    }
  },
  _inputTypes: {},
  registerWrapper: function(name, wrapper) {
    this._wrappers[name] = Ember.$.extend({}, this._wrappers['default'], wrapper);
  },
  getWrapper: function(name) {
    var wrapper = this._wrappers[name];
    Ember.assert("The wrapper '" + name + "' was not registered.", wrapper);
    return wrapper;
  },
  registerInputType: function(name, type){
    this._inputTypes[name] = type;
  },
  getInputType: function(name) {
    return this._inputTypes[name];
  }
});

})();



(function() {
Ember.EasyForm.WrapperConfigMixin = Ember.Mixin.create({
  getWrapperConfig: function(configName) {
    var wrapper = Ember.EasyForm.Config.getWrapper(this.get('wrapper'));
    return wrapper[configName];
  },
  wrapper: Ember.computed(function() {
    var wrapperView = this.nearestWithProperty('wrapper');
    if (wrapperView) {
      return wrapperView.get('wrapper');
    } else {
      return 'default';
    }
  })
});

})();



(function() {
Ember.EasyForm.InputElementClassMixin = Ember.Mixin.create(Ember.EasyForm.WrapperConfigMixin, {
  init: function() {
    var cls = this.getWrapperConfig('inputElementClass');
    this._super();
    if (!Ember.isEmpty(cls)) {
      this.classNames.push(cls);
    }
  },
});

})();



(function() {

})();



(function() {
Ember.Handlebars.registerHelper('error-field', function(property, options) {
  options = Ember.EasyForm.processOptions(property, options);

  if (options.hash.propertyBinding) {
    options.hash.property = Ember.Handlebars.get(this, options.hash.propertyBinding, options);
  }
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Error, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('form-for', function(object, options) {
  options.hash.contentBinding = object;
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Form, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('hint-field', function(property, options) {
  options = Ember.EasyForm.processOptions(property, options);

  if (options.hash.text || options.hash.textBinding) {
    return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Hint, options);
  }
});

})();



(function() {
Ember.Handlebars.registerHelper('input', function(property, options) {
  options = Ember.EasyForm.processOptions(property, options);
  options.hash.isBlock = !!(options.fn);
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Input, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('input-field', function(property, options) {
  options = Ember.EasyForm.processOptions(property, options);

  if (options.hash.propertyBinding) {
    options.hash.property = Ember.Handlebars.get(this, options.hash.propertyBinding, options);
  }

  if (options.hash.inputOptionsBinding) {
    options.hash.inputOptions = Ember.Handlebars.get(this, options.hash.inputOptionsBinding, options);
  }

  property = options.hash.property;

  var context = this,
    propertyType = function(property) {
      var constructor = (context.get('content') || context).constructor;

      if (constructor.proto) {
        return Ember.meta(constructor.proto(), false).descs[property];
      } else {
        return null;
      }
    };

  options.hash.valueBinding = property;
  options.hash.viewName = 'input-field-'+options.data.view.elementId;

  if (options.hash.inputOptions) {
    var inputOptions = options.hash.inputOptions, optionName;
    for (optionName in inputOptions) {
      if (inputOptions.hasOwnProperty(optionName)) {
       options.hash[optionName] = inputOptions[optionName];
      }
    }
    delete options.hash.inputOptions;
  }

  if (options.hash.as === 'text') {
    return Ember.Handlebars.helpers.view.call(context, Ember.EasyForm.TextArea, options);
  } else if (options.hash.as === 'select') {
    delete(options.hash.valueBinding);

    options.hash.contentBinding   = options.hash.collection;
    options.hash.selectionBinding = options.hash.selection;
    options.hash.valueBinding     = options.hash.value;

    if (Ember.isNone(options.hash.selectionBinding) && Ember.isNone(options.hash.valueBinding)) {
      options.hash.selectionBinding = property;
    }

    return Ember.Handlebars.helpers.view.call(context, Ember.EasyForm.Select, options);
  } else if (options.hash.as === 'checkbox') {
    if (Ember.isNone(options.hash.checkedBinding)) {
      options.hash.checkedBinding = property;
    }

    return Ember.Handlebars.helpers.view.call(context, Ember.EasyForm.Checkbox, options);
  } else {
    if (!options.hash.as) {
      if (property.match(/password/)) {
        options.hash.type = 'password';
      } else if (property.match(/email/)) {
        options.hash.type = 'email';
      } else if (property.match(/url/)) {
        options.hash.type = 'url';
      } else if (property.match(/color/)) {
        options.hash.type = 'color';
      } else if (property.match(/^tel/)) {
        options.hash.type = 'tel';
      } else if (property.match(/search/)) {
        options.hash.type = 'search';
      } else {
        if (propertyType(property) === 'number' || typeof(context.get(property)) === 'number') {
          options.hash.type = 'number';
        } else if (propertyType(property) === 'date' || (!Ember.isNone(context.get(property)) && context.get(property).constructor === Date)) {
          options.hash.type = 'date';
        } else if (propertyType(property) === 'boolean' || (!Ember.isNone(context.get(property)) && context.get(property).constructor === Boolean)) {
          options.hash.checkedBinding = property;
          return Ember.Handlebars.helpers.view.call(context, Ember.EasyForm.Checkbox, options);
        }
      }
    } else {
      var inputType = Ember.EasyForm.Config.getInputType(options.hash.as);
      if (inputType) {
        return Ember.Handlebars.helpers.view.call(context, inputType, options);
      }

      options.hash.type = options.hash.as;
    }
    return Ember.Handlebars.helpers.view.call(context, Ember.EasyForm.TextField, options);
  }
});

})();



(function() {
Ember.Handlebars.registerHelper('label-field', function(property, options) {
  options = Ember.EasyForm.processOptions(property, options);
  options.hash.viewName = 'label-field-'+options.data.view.elementId;
  return Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Label, options);
});

})();



(function() {
Ember.Handlebars.registerHelper('submit', function(value, options) {
  if (typeof(value) === 'object') {
    options = value;
    value = undefined;
  }
  options.hash.context = this;
  options.hash.value = value || 'Submit';
  return (options.hash.as === 'button') ?
    Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Button, options)
    :
    Ember.Handlebars.helpers.view.call(this, Ember.EasyForm.Submit, options);
});

})();



(function() {

})();



(function() {
Ember.EasyForm.BaseView = Ember.View.extend(Ember.EasyForm.WrapperConfigMixin);

})();



(function() {
Ember.EasyForm.Checkbox = Ember.Checkbox.extend(Ember.EasyForm.InputElementClassMixin);

})();



(function() {
Ember.EasyForm.Error = Ember.EasyForm.BaseView.extend({
  tagName: 'span',
  init: function() {
    this._super();
    this.classNames.push(this.getWrapperConfig('errorClass'));
    Ember.Binding.from('context.errors.' + this.property).to('errors').connect(this);
  },
  templateName: 'easyForm/error'
});

})();



(function() {
Ember.EasyForm.Form = Ember.EasyForm.BaseView.extend({
  tagName: 'form',
  attributeBindings: ['novalidate'],
  novalidate: 'novalidate',
  wrapper: 'default',
  init: function() {
    this._super();
    this.classNames.push(this.getWrapperConfig('formClass'));
    this.action = this.action || 'submit';
  },
  submit: function(event) {
    var _this = this, promise;

    if (event) {
      event.preventDefault();
    }

    if (Ember.isNone(this.get('context.validate'))) {
      this.get('controller').send(this.action);
    } else {
      if (!Ember.isNone(this.get('context').validate)) {
        promise = this.get('context').validate();
      } else {
        promise = this.get('context.content').validate();
      }
      promise.then(function() {
        if (_this.get('context.isValid')) {
          _this.get('controller').send(_this.action);
        }
      });
    }
  }
});

})();



(function() {
Ember.EasyForm.Hint = Ember.EasyForm.BaseView.extend({
  tagName: 'span',
  init: function() {
    this._super();
    this.classNames.push(this.getWrapperConfig('hintClass'));
  },
  render: function(buffer) {
    buffer.push(Handlebars.Utils.escapeExpression(this.get('text')));
  },
  textChanged: function() {
    this.rerender();
  }.observes('text')
});

})();



(function() {
Ember.EasyForm.Input = Ember.EasyForm.BaseView.extend({
  init: function() {
    this._super();
    this.classNameBindings.push('showError:' + this.getWrapperConfig('fieldErrorClass'));
    this.classNames.push(this.getWrapperConfig('inputClass'));
    Ember.defineProperty(this, 'showError', Ember.computed.and('canShowValidationError', 'context.errors.' + this.property + '.firstObject'));
    if (!this.isBlock) {
      if (this.getWrapperConfig('wrapControls')) {
        this.set('templateName', 'easyForm/wrapped_input');
      } else {
        this.set('templateName', 'easyForm/input');
      }
    }
  },
  setupValidationDependencies: function() {
    var keys = this.get('context._dependentValidationKeys'), key;
    if (keys) {
      for(key in keys) {
        if (keys[key].contains(this.property)) {
          this._keysForValidationDependencies.pushObject(key);
        }
      }
    }
  }.on('init'),
  _keysForValidationDependencies: Ember.A(),
  dependentValidationKeyCanTrigger: false,
  tagName: 'div',
  classNames: ['string'],
  didInsertElement: function() {
    this.set('label-field-'+this.elementId+'.for', this.get('input-field-'+this.elementId+'.elementId'));
  },
  concatenatedProperties: ['inputOptions', 'bindableInputOptions'],
  inputOptions: ['as', 'collection', 'optionValuePath', 'optionLabelPath', 'selection', 'value', 'multiple'],
  bindableInputOptions: ['placeholder', 'prompt'],
  controlsWrapperClass: function() {
    return this.getWrapperConfig('controlsWrapperClass');
  }.property(),
  inputOptionsValues: function() {
    var options = {}, i, key, keyBinding, inputOptions = this.inputOptions, bindableInputOptions = this.bindableInputOptions;
    for (i = 0; i < inputOptions.length; i++) {
      key = inputOptions[i];
      if (this[key]) {
        if (typeof(this[key]) === 'boolean') {
          this[key] = key;
        }

        options[key] = this[key];
      }
    }
    for (i = 0; i < bindableInputOptions.length; i++) {
      key = bindableInputOptions[i];
      keyBinding = key + 'Binding';
      if (this[key] || this[keyBinding]) {
        options[keyBinding] = 'view.' + key;
      }
    }
    return options;
  }.property(),
  focusOut: function() {
    this.set('hasFocusedOut', true);
    this.showValidationError();
  },
  showValidationError: function() {
    if (this.get('hasFocusedOut')) {
      if (Ember.isEmpty(this.get('context.errors.' + this.property))) {
        this.set('canShowValidationError', false);
      } else {
        this.set('canShowValidationError', true);
      }
    }
  },
  input: function() {
    this._keysForValidationDependencies.forEach(function(key) {
     this.get('parentView.childViews').forEach(function(view) {
       if (view.property === key) {
         view.showValidationError();
       }
     }, this);
    }, this);
  }
});

})();



(function() {
Ember.EasyForm.Label = Ember.EasyForm.BaseView.extend({
  tagName: 'label',
  attributeBindings: ['for'],
  labelText: function() {
    return this.get('text') || Ember.EasyForm.humanize(this.get('property'));
  }.property('text', 'property'),
  init: function() {
    this._super();
    this.classNames.push(this.getWrapperConfig('labelClass'));
  },
  render: function(buffer) {
    buffer.push(Handlebars.Utils.escapeExpression(this.get('labelText')));
  },
  labelTextChanged: function() {
    this.rerender();
  }.observes('labelText')
});

})();



(function() {
Ember.EasyForm.Select = Ember.Select.extend(Ember.EasyForm.InputElementClassMixin);

})();



(function() {
Ember.EasyForm.Submit = Ember.View.extend({
  tagName: 'input',
  attributeBindings: ['type', 'value', 'disabled'],
  type: 'submit',
  disabled: function() {
    return this.get('context.isInvalid');
  }.property('context.isInvalid'),
  init: function() {
    this._super();
    this.set('value', this.value);
  }
});

})();



(function() {
Ember.EasyForm.Button = Ember.View.extend({
  tagName: 'button',
  template: Ember.Handlebars.compile('{{text}}'),
  attributeBindings: ['type', 'disabled'],
  type: 'submit',
  disabled: function() {
    return this.get('context.isInvalid');
  }.property('context.isInvalid'),
  init: function() {
    this._super();
    this.set('context.text', this.value);
  }
});

})();



(function() {
Ember.EasyForm.TextArea = Ember.TextArea.extend(Ember.EasyForm.InputElementClassMixin);

})();



(function() {
Ember.EasyForm.TextField = Ember.TextField.extend(Ember.EasyForm.InputElementClassMixin);

})();



(function() {

})();



(function() {
Ember.TEMPLATES['easyForm/error'] = Ember.Handlebars.compile('{{view.errors.firstObject}}');

})();



(function() {
Ember.TEMPLATES['easyForm/input'] = Ember.Handlebars.compile('{{label-field propertyBinding="view.property" textBinding="view.label"}}{{partial "easyForm/inputControls"}}');

})();



(function() {
Ember.TEMPLATES['easyForm/inputControls'] = Ember.Handlebars.compile('{{input-field propertyBinding="view.property" inputOptionsBinding="view.inputOptionsValues"}}{{#if view.showError}}{{error-field propertyBinding="view.property"}}{{/if}}{{#if view.hint}}{{hint-field propertyBinding="view.property" textBinding="view.hint"}}{{/if}}');

})();



(function() {
Ember.TEMPLATES['easyForm/wrapped_input'] = Ember.Handlebars.compile('{{label-field propertyBinding="view.property" textBinding="view.label"}}<div class="{{unbound view.controlsWrapperClass}}">{{partial "easyForm/inputControls"}}</div>');

})();



(function() {
Ember.EasyForm.TEMPLATES = {};

})();



(function() {
Ember.EasyForm.humanize = function(string) {
  return string.underscore().split('_').join(' ').capitalize();
};

Ember.EasyForm.processOptions = function(property, options) {
  if (options) {
    options.hash.property = property;
  } else {
    options = property;
  }

  return options;
};

})();



(function() {

})();

