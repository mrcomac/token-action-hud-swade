import { SavageActionHandler } from './action-handler.js'
import { SavageRollHandler as CoreRoll } from './core-rollhandler.js'
import { BR2RollHandler as BR2Roll } from './br2-rollhandler.js'
import { SwadeToolsRollHandler } from './swadetools-rollhandler.js'
import { MODULEDIR } from './constants.js'

export let SavageSystemManager = null

export let DEFAULTS = null

function chatItem(message,actor) {
    //crates chatmessage
    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({token: actor}),
        content: message
        });
}


Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {
    SavageSystemManager = class SavageSystemManager extends coreModule.api.SystemManager {
        /** @override */
        doGetActionHandler() {
            return new SavageActionHandler()
        }

        getAvailableRollHandlers() {
            let coreTitle = "swade"

            

            let choices = { core: "Core SWADE" }
            if (coreModule.api.Utils.isModuleActive('betterrolls-swade2')) {
                SavageSystemManager.addHandler(choices, "betterrolls-swade2")
            } else if(coreModule.api.Utils.isModuleActive('swade-tools')) {
                SavageSystemManager.addHandler(choices, "swade-tools")
            } else {
                choices = { core: coreTitle }
                SavageSystemManager.addHandler(choices, 'swade')
            }

            return choices
        }

        /** @override */
        doGetRollHandler(handlerId) {
            let rollHandler
            switch (handlerId) {
                case 'betterrolls-swade2':
                    rollHandler = new BR2Roll()
                break
                case 'swade-tools':
                    rollHandler = new SwadeToolsRollHandler()
                break
                case 'core':
                default:
                    rollHandler = new CoreRoll()
                break
            }

            return rollHandler
        }

        /** @override */
        /*doRegisterSettings (updateFunc) {
            systemSettings.register(updateFunc)
        }*/

        async doRegisterDefaultFlags() {
            const GROUP = {
                utility: { id: 'utility', name: coreModule.api.Utils.i18n('SWADE.General'), type: 'system' },
                attributes: { id: 'attributes', name: coreModule.api.Utils.i18n('SWADE.Attributes'), type: 'system' },
                attributesdev: { id: 'derivedstats', name: coreModule.api.Utils.i18n('SWADE.Derived'), type: 'system' },
                skills: { id: 'skills', name: coreModule.api.Utils.i18n('SWADE.Skills'), type: 'system' },
                powers: { id: 'powers', name: coreModule.api.Utils.i18n('SWADE.Pow'), type: 'system' },
                powersfav: { id: 'powersfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess'), type: 'system' },
                powerspoints: { id: 'powerspoints', name: coreModule.api.Utils.i18n('SWADE.PP'), type: 'system' },
                consumables: { id: 'consumables', name: coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'), type: 'system' },
                consumablesfav: { id: 'consumablesfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess'), type: 'system' },
                gears: { id: 'gears', name: coreModule.api.Utils.i18n('TYPES.Item.gear'), type: 'system' },
                gearsfav: { id: 'gearsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess'), type: 'system' },
                weapons: { id: 'weapons', name: coreModule.api.Utils.i18n('SWADE.Weapons'), type: 'system' },
                weaponsfav: { id: 'weaponsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess'), type: 'system' },
                actions: { id: 'actions', name: coreModule.api.Utils.i18n('SWADE.Actions'), type: 'system' },
                actionsfav: { id: 'actionsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess'), type: 'system' },
                healthwounds: { id: 'healthwounds', name: "Wounds", type: 'system' },
                healthfatigue: { id: 'healthfatigue', name: "Fatigue", type: 'system' },
                utilitybenny: { id: 'utilitybenny', name: coreModule.api.Utils.i18n('SWADE.Rolls.Benny'), type: 'system' },
                utilitystatuses: { id: 'utilitystatuses', name: coreModule.api.Utils.i18n('SWADE.Status'), type: 'system' },
                effectsperm: { id: 'effectsperm', name: coreModule.api.Utils.i18n('SWADE.EffectsPermanent'), type: 'system' },
                effectstemp: { id: 'effectstemp', name: coreModule.api.Utils.i18n('SWADE.EffectsTemporary'), type: 'system' }
                
            }
            const groups = GROUP
            Object.values(groups).forEach(group => {
                group.name = group.name
                group.listName = `Group: ${group.name}`
            })
            const groupsArray = Object.values(groups)
            DEFAULTS = {
                layout: [
                    {
                        nestId: 'utility',
                        id: 'utility',
                        name: coreModule.api.Utils.i18n('SWADE.General'),
                        groups: [
                            { ...groups.utility, nestId: 'utility_utility' },
                            { ...groups.utilitybenny, nestId: 'utility_benny' },
                            { ...groups.utilitystatuses, nestId: 'utility_statuses' }
                        ]
                    },
                    {
                        nestId: 'health',
                        id: 'health',
                        name: "Health",
                        groups: [
                            { ...groups.healthwounds, nestId: 'health_wounds' },
                            { ...groups.healthfatigue, nestId: 'health_fatigue' }
                        ]
                    },
                    {
                        nestId: 'actions',
                        id: 'actions',
                        name: coreModule.api.Utils.i18n('SWADE.Actions'),
                        groups: [
                            { ...groups.actionsfav, nestId: 'actions_favorities' },
                            { ...groups.actions, nestId: 'actions_utility' }
                        ]
                    },
                    {
                        nestId: 'attributes',
                        id: 'attributes',
                        name: coreModule.api.Utils.i18n('SWADE.Attributes'),
                        groups: [
                            { ...groups.attributes, nestId: 'attributes_abilities' },
                            { ...groups.attributesdev, nestId: 'derived_abilities' }
                        ]
                    },
                    {
                        nestId: 'skills',
                        id: 'skills',
                        name: coreModule.api.Utils.i18n('SWADE.Skills'),
                        groups: [
                            { ...groups.skills, nestId: 'skills_abilities' }
                        ]
                    },
                    {
                        nestId: 'powers',
                        id: 'powers',
                        name: coreModule.api.Utils.i18n('SWADE.Pow'),
                        groups: [
                            { ...groups.powerspoints, nestId: 'powers_points' },
                            { ...groups.powersfav, nestId: 'powers_favorities' },
                            { ...groups.powers, nestId: 'powers_abilities' }
                        ]
                    },
                    {
                        nestId: 'weapons',
                        id: 'weapons',
                        name: coreModule.api.Utils.i18n('SWADE.Weapons'),
                        groups: [
                            { ...groups.weaponsfav, nestId: 'weapons_favorities' },
                            { ...groups.weapons, nestId: 'weapons_utility' }
                        ]
                    },
                    {
                        nestId: 'consumables',
                        id: 'consumables',
                        name: coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'),
                        groups: [
                            { ...groups.consumablesfav, nestId: 'consumables_favorities' },
                            { ...groups.consumables, nestId: 'consumables_gear' }
                        ]
                    },
                    {
                        nestId: 'gears',
                        id: 'gears',
                        name: coreModule.api.Utils.i18n('TYPES.Item.gear'),
                        groups: [
                            { ...groups.gearsfav, nestId: 'gears_favorities' },
                            { ...groups.gears, nestId: 'gears_gear' }
                        ]
                    },
                    {
                        nestId: 'effects',
                        id: 'effects',
                        name: coreModule.api.Utils.i18n('SWADE.Effects'),
                        groups: [
                            { ...groups.effectsperm, nestId: 'effects_permanent' },
                            { ...groups.effectstemp, nestId: 'effects_temp' }
                        ]
                    }
                    
                ],
                groups: groupsArray
            }
            game.tokenActionHud.defaults = DEFAULTS
            return DEFAULTS
        }
    }

    /* STARTING POINT */

    const module = game.modules.get('token-action-hud-swade');
    module.api = {
        requiredCoreModuleVersion: '1.4',
        SystemManager: SavageSystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
});

