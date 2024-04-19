export const MODULE = {
    ID: "token-action-hud-swade"
}

export const ATTRIBUTE_ID = {
    'SWADE.AttrAgi': 'agility', 
    'SWADE.AttrSma': "smarts", 
    'SWADE.AttrSpr': "spirit", 
    'SWADE.AttrStr': "strengh",
    'SWADE.AttrVig': "vigor"
}

export const MODULEDIR = 'modules/' + MODULE.ID + '/'
export const IMG_DICE = MODULEDIR + 'assets/'
export const SYSDIR = 'systems/swade/'
export const ICONSDIR = SYSDIR + 'assets/icons/'


export const MAIN_ACTIONS = []
export const FREE_ACTIONS = []

export function init_help_buttons(delimiter) {
    MAIN_ACTIONS.length = 0;
    FREE_ACTIONS.length = 0;

    MAIN_ACTIONS.push({
        id:'attack',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.attack.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.attack.description'
        ),
        img: "icons/skills/melee/strike-sword-steel-yellow.webp",
        encodedValue: ['main_action', "attack"].join(delimiter)
        //info2: { text: "You can attack an enemy with a melee or ranged weapon." }
    })
    MAIN_ACTIONS.push({
        id:'Multi-Action',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.multi-action.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.multi-action.description'
        ),
        img: "icons/skills/melee/strikes-sword-scimitar.webp",
        encodedValue: ['main_action', "Multi-Action"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Wild-Attack',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.wild-attack.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.wild-attack.description'
        ),
        img: "icons/skills/melee/sword-twirl-orange.webp",
        encodedValue: ['main_action', "Wild-Attack"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Desperate-Attack',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.desperate-attack.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.desperate-attack.description'
        ),
        img: "icons/skills/melee/maneuver-greatsword-yellow.webp",
        encodedValue: ['main_action', "Desperate-Attack"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Called-Shot',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.called-shot.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.called-shot.description'
        ),
        img: "icons/skills/ranged/target-bullseye-arrow-blue.webp",
        encodedValue: ['main_action', "Called-Shot"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Aim',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.aim.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.aim.description'
        ),
        img: "icons/skills/ranged/person-archery-bow-attack-orange.webp",
        encodedValue: ['main_action', "Aim"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Push',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.push.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.push.description'
        ),
        img: "icons/skills/movement/arrow-upward-blue.webp",
        encodedValue: ['main_action', "Push"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Grapple',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.grapple.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.grapple.description'
        ),
        img: "icons/skills/social/intimidation-impressing.webp",
        encodedValue: ['main_action', "Grapple"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Defend',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.defend.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.defend.description'
        ),
        img: "icons/skills/melee/shield-block-gray-orange.webp",
        encodedValue: ['main_action', "Defend"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Support',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.support.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.support.description'
        ),
        img: "icons/skills/social/diplomacy-handshake-gray.webp",
        encodedValue: ['main_action', "Support"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Test',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.test.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.test.description'
        ),
        img: "icons/skills/social/thumbsup-approval-like.webp",
        encodedValue: ['main_action', "Test"].join(delimiter)
    })
    MAIN_ACTIONS.push({
        id:'Reload',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.reload.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.reload.description'
        ),
        img: "icons/weapons/ammunition/bullets-cartridge-shell-gray.webp",
        encodedValue: ['main_action', "Reload"].join(delimiter)
    })

    FREE_ACTIONS.push({
        id:'move',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.move.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.move.description'
        ),
        img: "icons/skills/movement/arrow-upward-yellow.webp",
        encodedValue: ['main_action', "move"].join(delimiter)
    })
    FREE_ACTIONS.push({
        id:'Run',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.run.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.run.description'
        ),
        img: 'icons/skills/movement/figure-running-gray.webp',
        encodedValue: ['main_action', 'Run'].join(delimiter)
    })
    FREE_ACTIONS.push({
        id:'Speak',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.speak.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.speak.description'
        ),
        img: 'icons/skills/trades/music-singing-voice-blue.webp',
        encodedValue: ['main_action', 'Speak'].join(delimiter)
    })
    FREE_ACTIONS.push({
        id:'Go-Prone',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.go-prone.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.go-prone.description'
        ),
        img: 'icons/magic/control/silhouette-fall-slip-prone.webp',
        encodedValue: ['main_action', 'Go-Prone'].join(delimiter)
    })
    FREE_ACTIONS.push({
        id:'Drop',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.drop.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.drop.description'
        ),
        img: 'icons/magic/movement/chevrons-down-yellow.webp',
        encodedValue: ['main_action', 'Drop'].join(delimiter)
    })
    FREE_ACTIONS.push({
        id:'Not-Sure',
        name: game.i18n.localize(
            'tokenActionHud.swade.actions.not-sure.name'
        ),
        description: game.i18n.localize(
            'tokenActionHud.swade.actions.not-sure.description'
        ),
        img: 'icons/magic/symbols/question-stone-yellow.webp',
        encodedValue: ['main_action', 'Not-Sure'].join(delimiter)
    })
}

