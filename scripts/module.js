import { SavageActionHandler } from './action-handler.js'
import { SavageRollHandler as CoreRoll } from './core-rollhandler.js'
import { BR2RollHandler as BR2Roll } from './br2-rollhandler.js'
import { SwadeToolsRollHandler } from './swadetools-rollhandler.js'
import * as systemSettings from './settings.js'

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
        getActionHandler() {
            return new SavageActionHandler()
        }

        getAvailableRollHandlers() {
            let coreTitle = "swade"
            let choices = { core: "Core SWADE" }
            if (coreModule.api.Utils.isModuleActive('betterrolls-swade2')) {
                SavageSystemManager.addHandler(choices, "betterrolls-swade2")
                SavageSystemManager.addHandler(choices, "betterrolls-swade2-crtl")
                SavageSystemManager.addHandler(choices, "betterrolls-swade2-shift")
                SavageSystemManager.addHandler(choices, "betterrolls-swade2-alt")
            } else if(coreModule.api.Utils.isModuleActive('swade-tools')) {
                SavageSystemManager.addHandler(choices, "swade-tools")
            } else {
                choices = { core: coreTitle }
                SavageSystemManager.addHandler(choices, 'swade')
            }

            return choices
        }

        /** @override */
        getRollHandler(handlerId) {
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
        registerSettings (updateFunc) {
            systemSettings.register(updateFunc)
        }

        async doRegisterDefaultFlags() {
            const GROUP = {
                utility: { id: 'utility', name: coreModule.api.Utils.i18n('SWADE.General'), type: 'system' },
                attributes: { id: 'attributes', name: coreModule.api.Utils.i18n('SWADE.Attributes'), type: 'system' },
                derivedstats: { id: 'derivedstats', name: coreModule.api.Utils.i18n('SWADE.Derived'), type: 'system' },
                skills: { id: 'skills', name: coreModule.api.Utils.i18n('SWADE.Skills'), type: 'system' },
                powers: { id: 'powers', name: coreModule.api.Utils.i18n('SWADE.Pow'), type: 'system' },
                powersfavorite: { id: 'powersfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess')+"-"+coreModule.api.Utils.i18n('SWADE.Pow'), type: 'system' },
                powerpoints: { id: 'powerpoints', name: coreModule.api.Utils.i18n('SWADE.PP'), type: 'system' },
                consumables: { id: 'consumables', name: coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'), type: 'system' },
                consumablesfavorite: { id: 'consumablesfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess')+"-"+coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'), type: 'system' },
                gears: { id: 'gears', name: coreModule.api.Utils.i18n('TYPES.Item.gear'), type: 'system' },
                gearsfavorite: { id: 'gearsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess')+"-"+coreModule.api.Utils.i18n('TYPES.Item.gear'), type: 'system' },
                weapons: { id: 'weapons', name: coreModule.api.Utils.i18n('SWADE.Weapons'), type: 'system' },
                weapons_ae: { id: 'weapons_ae', name: "Active Effects", type: 'system' },
                armorsfavorite: { id: 'armorsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess')+"-"+coreModule.api.Utils.i18n('SWADE.Armors')+"&"+coreModule.api.Utils.i18n('SWADE.Shields'), type: 'system' },
                armors: { id: 'armor', name: coreModule.api.Utils.i18n('SWADE.Armors'), type: 'system' },
                shields: { id: 'shield', name: coreModule.api.Utils.i18n('SWADE.Shields'), type: 'system' },
                armors_ae: { id: 'armors_ae', name: "Active Effects", type: 'system' },
                weaponsfavorite: { id: 'weaponsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess')+"-"+coreModule.api.Utils.i18n('SWADE.Weapons'), type: 'system' },
                actions: { id: 'actions', name: coreModule.api.Utils.i18n('SWADE.Actions'), type: 'system' },
                actionsfavorite: { id: 'actionsfavorite', name: coreModule.api.Utils.i18n('SWADE.QuickAccess')+"-"+coreModule.api.Utils.i18n('SWADE.Actions'), type: 'system' },
                wounds: { id: 'wounds', name: "Wounds", type: 'system' },
                fatigue: { id: 'fatigue', name: "Fatigue", type: 'system' },
                benny: { id: 'benny', name: coreModule.api.Utils.i18n('SWADE.Rolls.Benny'), type: 'system' },
                statuses: { id: 'statuses', name: coreModule.api.Utils.i18n('SWADE.Status'), type: 'system' },
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
                            { ...groups.benny, nestId: 'utility_benny' }
                        ]
                    },
                    {
                        nestId: 'health',
                        id: 'health',
                        name: "Health",
                        groups: [
                            { ...groups.wounds, nestId: 'health_wounds' },
                            { ...groups.fatigue, nestId: 'health_fatigue' }
                        ]
                    },
                    {
                        nestId: 'actions',
                        id: 'actions',
                        name: coreModule.api.Utils.i18n('SWADE.Actions'),
                        groups: [
                            { ...groups.actionsfavorite, nestId: 'actions_actionsfavorite' },
                            { ...groups.actions, nestId: 'actions_actions' }
                        ]
                    },
                    {
                        nestId: 'attributes',
                        id: 'attributes',
                        name: coreModule.api.Utils.i18n('SWADE.Attributes'),
                        groups: [
                            { ...groups.attributes, nestId: 'attributes_attributes' },
                            { ...groups.derivedstats, nestId: 'attributes_derivedstats' }
                        ]
                    },
                    {
                        nestId: 'skills',
                        id: 'skills',
                        name: coreModule.api.Utils.i18n('SWADE.Skills'),
                        groups: [
                            { ...groups.skills, nestId: 'skills_skills' }
                        ]
                    },
                    {
                        nestId: 'powers',
                        id: 'powers',
                        name: coreModule.api.Utils.i18n('SWADE.Pow'),
                        groups: [
                            { ...groups.powerpoints, nestId: 'powers_powerpoints' },
                            { ...groups.powersfavorite, nestId: 'powers_powersfavorite' },
                            { ...groups.powers, nestId: 'powers_powers' }
                        ]
                    },
                    {
                        nestId: 'armors',
                        id: 'armors',
                        name: coreModule.api.Utils.i18n('SWADE.Armors')+" & "+coreModule.api.Utils.i18n('SWADE.Shields'),
                        groups: [
                            { ...groups.armorsfavorite, nestId: 'armors_armorsfavorite' },
                            { ...groups.armors, nestId: 'armors_armors' },
                            { ...groups.shields, nestId: 'armors_shields' },
                            { ...groups.armors_ae, nestId: 'armors_armorsae' }
                        ]
                    },
                    {
                        nestId: 'weapons',
                        id: 'weapons',
                        name: coreModule.api.Utils.i18n('SWADE.Weapons'),
                        groups: [
                            { ...groups.weaponsfavorite, nestId: 'weapons_weaponsfavorite' },
                            { ...groups.weapons, nestId: 'weapons_weapons' },
                            { ...groups.weapons_ae, nestId: 'weapons_weaponsae' }
                        ]
                    },
                    {
                        nestId: 'consumables',
                        id: 'consumables',
                        name: coreModule.api.Utils.i18n('SWADE.Consumable.Consumables'),
                        groups: [
                            { ...groups.consumablesfavorite, nestId: 'consumables_consumablesfavorite' },
                            { ...groups.consumables, nestId: 'consumables_consumables' }
                        ]
                    },
                    {
                        nestId: 'gears',
                        id: 'gears',
                        name: coreModule.api.Utils.i18n('TYPES.Item.gear'),
                        groups: [
                            { ...groups.gearsfavorite, nestId: 'gears_gearsfavorite' },
                            { ...groups.gears, nestId: 'gears_gears' }
                        ]
                    },
                    {
                        nestId: 'effects',
                        id: 'effects',
                        name: coreModule.api.Utils.i18n('SWADE.Effects'),
                        groups: [
                            { ...groups.effectsperm, nestId: 'effects_effectsperm' },
                            { ...groups.effectstemp, nestId: 'effects_effectstemp' },
                            { ...groups.statuses, nestId: 'effects_statuses'}
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
        requiredCoreModuleVersion: '1.5',
        SystemManager: SavageSystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
});

