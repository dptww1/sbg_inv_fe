require 'caracal'
require 'json'

#========================================================================
class Scenario
  attr_accessor :docx_output_filename, :title

  @input_json
  @actions
  @profiles
  @specials
  @spells

  #------------------------------------------------------------------------
  def initialize(filename)
    @docx_output_filename = filename.sub('.json', '.docx')
    @title = filename.sub(%r{^.*/}, "").sub(/.json/, '').sub(/^\d+\s*/, "")

    @input_json = JSON.load_file!(filename)

    @actions  = JSON.load_file!("#{__dir__}/../data/actions.json")
    @profiles = JSON.load_file!("#{__dir__}/../data/profiles.json")
    @specials = JSON.load_file!("#{__dir__}/../data/specials.json")
    @spells   = JSON.load_file!("#{__dir__}/../data/spells.json")
  end

  #------------------------------------------------------------------------
  def actions_for(name)
    attribute_override(name, 'actions') || @profiles[name]['actions'] || []
  end

  #------------------------------------------------------------------------
  def apply_table_formatting(config, table_name, side='both')
    config = config.clone

    column_sizes_for(table_name, side).each do |col_spec|
      config[col_spec['column']]['width'] = 20.0 * 72.0 * col_spec['width']
    end

    config
  end

  #------------------------------------------------------------------------
  def attribute_override(name, attribute)
    if @input_json['overrides'] &&
       @input_json['overrides'][name] &&
       @input_json['overrides'][name][attribute]
      return @input_json['overrides'][name][attribute]
    end

    return nil
  end

  #------------------------------------------------------------------------
  def column_sizes_for(table, side)
    (@input_json["formatting"] &&
     @input_json["formatting"]["tables"] &&
     @input_json["formatting"]["tables"][table] &&
     @input_json["formatting"]["tables"][table][side]) || []
  end

  #------------------------------------------------------------------------
  def effect_for_action(action_name)
    abort "no action [#{action_name}]!" unless @actions[action_name]
    @actions[action_name]['effect']
  end

  #------------------------------------------------------------------------
  def effect_for_special(special_name)
    # Most common case is a straightforward lookup
    if @specials[special_name] && @specials[special_name]['effect']
      return @specials[special_name]['effect']
    end

    # When that fails, this might be a templatized special
    template_key = @specials.keys.find { |k| Regexp.new(Regexp.escape(k).sub('%s', '(.*)')).match(special_name) }

    abort "no effect found for special [#{special_name}]!" unless template_key && $1

    @specials[template_key]['effect'].sub('%s', $1)
  end

  #------------------------------------------------------------------------
  def effect_for_spell(spell_name)
    @spells[spell_name]['effect']
  end

  #------------------------------------------------------------------------
  def magic_for(name)
    attribute_override(name, 'magic') || @profiles[name]['magic'] || []
  end

  #------------------------------------------------------------------------
  # side - 'good' or 'evil'
  #------------------------------------------------------------------------#
  def objectives(side)
    @input_json['objectives'][side]
  end

  #------------------------------------------------------------------------
  # side - 'good' or 'evil'
  #------------------------------------------------------------------------#
  def order_of_battle(side)
    @input_json[side]
  end

  #------------------------------------------------------------------------
  def page_break_before(section_name)
    @input_json["formatting"] &&
      @input_json["formatting"]["pageBreakBefore"] &&
      @input_json["formatting"]["pageBreakBefore"].include?(section_name)
  end

  #------------------------------------------------------------------------
  def special_rules
    @input_json['specialRules']
  end

  #------------------------------------------------------------------------
  def specials_for(name)
    attribute_override(name, 'specials') || @profiles[name]['specials'] || []
  end

  #------------------------------------------------------------------------
  def statline_for(name)
    abort "no profile for #{name}!" unless @profiles[name]
    attribute_override(name, 'statline') || @profiles[name]['statline']
  end
end
