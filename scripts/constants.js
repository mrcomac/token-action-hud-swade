export const MODULE = {
    ID: "token-action-hud-swade"
}

export const ATTRIBUTE_ID = {
    'SWADE.AttrAgi': 'agility',
    'SWADE.AttrSma': "smarts",
    'SWADE.AttrSpr': "spirit",
    'SWADE.AttrStr': "strengh", // Typo here: "strengh" should be "strength"
    'SWADE.AttrVig': "vigor"
}

export const MODULEDIR = 'modules/' + MODULE.ID + '/'
export const IMG_DICE = MODULEDIR + 'assets/'
export const SYSDIR = 'systems/swade/'
export const ICONSDIR = SYSDIR + 'assets/icons/'


export const MAIN_ACTIONS = [
    {
        id: "Attack",
        name: "tokenActionHud.swade.actions.attack.name",
        tooltip: "tokenActionHud.swade.actions.attack.description",
        img: "icons/skills/melee/strike-sword-steel-yellow.webp",
        encodedValue: ""
    },
    {
        id: "Multi-Action",
        name: "tokenActionHud.swade.actions.multi-action.name",
        tooltip: "tokenActionHud.swade.actions.multi-action.description",
        img: "icons/skills/melee/strikes-sword-scimitar.webp",
        encodedValue: ""
    },
    {
        id: "Wild-Attack",
        name: "tokenActionHud.swade.actions.wild-attack.name",
        tooltip: "tokenActionHud.swade.actions.wild-attack.description",
        img: "icons/skills/melee/sword-twirl-orange.webp",
        encodedValue: ""
    },
    {
        id: "Desperate-Attack",
        name: "tokenActionHud.swade.actions.desperate-attack.name",
        tooltip: "tokenActionHud.swade.actions.desperate-attack.description",
        img: "icons/skills/melee/maneuver-greatsword-yellow.webp",
        encodedValue: ""
    },
    {
        id: "Called-Shot",
        name: "tokenActionHud.swade.actions.called-shot.name",
        tooltip: "tokenActionHud.swade.actions.called-shot.description",
        img: "icons/skills/ranged/target-bullseye-arrow-blue.webp",
        encodedValue: ""
    },
    {
        id: "Aim",
        name: "tokenActionHud.swade.actions.aim.name",
        tooltip: "tokenActionHud.swade.actions.aim.description",
        img: "icons/skills/ranged/person-archery-bow-attack-orange.webp",
        encodedValue: ""
    },
    {
        id: "Push",
        name: "tokenActionHud.swade.actions.push.name",
        tooltip: "tokenActionHud.swade.actions.push.description",
        img: "icons/skills/movement/arrow-upward-blue.webp",
        encodedValue: ""
    },
    {
        id: "Grapple",
        name: "tokenActionHud.swade.actions.grapple.name",
        tooltip: "tokenActionHud.swade.actions.grapple.description",
        img: "icons/skills/social/intimidation-impressing.webp",
        encodedValue: ""
    },
    {
        id: "Defend",
        name: "tokenActionHud.swade.actions.defend.name",
        tooltip: "tokenActionHud.swade.actions.defend.description",
        img: "icons/skills/melee/shield-block-gray-orange.webp",
        encodedValue: ""
    },
    {
        id: "Support",
        name: "tokenActionHud.swade.actions.support.name",
        tooltip: "tokenActionHud.swade.actions.support.description",
        img: "icons/skills/social/diplomacy-handshake-gray.webp",
        encodedValue: ""
    },
    {
        id: "Test",
        name: "tokenActionHud.swade.actions.test.name",
        tooltip: "tokenActionHud.swade.actions.test.description",
        img: "icons/skills/social/thumbsup-approval-like.webp",
        encodedValue: ""
    },
    {
        id: "Reload",
        name: "tokenActionHud.swade.actions.reload.name",
        tooltip: "tokenActionHud.swade.actions.reload.description",
        img: "icons/weapons/ammunition/bullets-cartridge-shell-gray.webp",
        encodedValue: ""
    }
]
export const FREE_ACTIONS = [{
    id: "Move",
    name: "tokenActionHud.swade.actions.move.name",
    tooltip: "tokenActionHud.swade.actions.move.description",
    img: "icons/skills/movement/arrow-upward-yellow.webp",
    encodedValue: ""
},{
    id: "Run",
    name: "tokenActionHud.swade.actions.run.name",
    tooltip: "tokenActionHud.swade.actions.run.description",
    img: "icons/skills/movement/figure-running-gray.webp",
    encodedValue: ""
},{
    id: "Speak",
    name: "tokenActionHud.swade.actions.speak.name",
    tooltip: "tokenActionHud.swade.actions.speak.description",
    img: "icons/skills/trades/music-singing-voice-blue.webp",
    encodedValue: ""
},{
    id: "Go-Prone",
    name: "tokenActionHud.swade.actions.go-prone.name",
    tooltip: "tokenActionHud.swade.actions.go-prone.description",
    img: "icons/magic/control/silhouette-fall-slip-prone.webp",
    encodedValue: ""
},{
    id: "Drop",
    name: "tokenActionHud.swade.actions.drop.name",
    tooltip: "tokenActionHud.swade.actions.drop.description",
    img: "icons/magic/movement/chevrons-down-yellow.webp",
    encodedValue: ""
},{
    id: "Not-Sure",
    name: "tokenActionHud.swade.actions.not-sure.name",
    tooltip: "tokenActionHud.swade.actions.not-sure.description",
    img: "icons/magic/symbols/question-stone-yellow.webp",
    encodedValue: ""
}]

