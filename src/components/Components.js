// ECS Components

export class TransformComp {
  static type = 'transform';
  constructor(x = 0, y = 0, z = 0, rotY = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.rotY = rotY;
  }
}

export class VelocityComp {
  static type = 'velocity';
  constructor(vx = 0, vz = 0) {
    this.vx = vx;
    this.vz = vz;
  }
}

export class MeshComp {
  static type = 'mesh';
  constructor(mesh = null) {
    this.mesh = mesh;
  }
}

export class PlayerComp {
  static type = 'player';
  constructor(name = 'Juan') {
    this.name = name;
    this.money = 50000;
    this.currentActivity = null;
    this.activityTimer = 0;
    this.activityDuration = 0;
    this.speed = 15;
    this.isInsideBuilding = false;
    this.currentBuilding = null;
    this.exteriorX = 0;
    this.exteriorZ = 10;
    this.interiorBounds = null;
    this.relationships = {}; // npcName -> 0-100
  }
}

export class NeedsComp {
  static type = 'needs';
  constructor() {
    this.gutom = 70;       // hunger
    this.lakas = 80;       // energy
    this.lipunan = 60;     // social
    this.kasiyahan = 70;   // fun
    this.kalinisan = 80;   // hygiene
    this.karera = 30;      // career
  }
}

export class NPCComp {
  static type = 'npc';
  constructor(name = '', npcType = 'walker') {
    this.name = name;
    this.npcType = npcType;
    this.targetX = 0;
    this.targetZ = 0;
    this.waitTime = 0;
    this.speed = 4 + Math.random() * 4;
    this.dialogue = [];
    this.dialogueIdx = 0;
    this.relationship = 0;
  }
}

export class BuildingComp {
  static type = 'building';
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.nameEn = data.nameEn || '';
    this.buildingType = data.buildingType || '';
    this.activities = data.activities || [];
    this.x = data.x || 0;
    this.z = data.z || 0;
    this.width = data.width || 10;
    this.depth = data.depth || 10;
    this.interactionRadius = data.interactionRadius || 12;
    this.color = data.color || 0xffffff;
    this.roofColor = data.roofColor || 0xff0000;
    this.height = data.height || 8;
    this.isOutdoor = data.isOutdoor || false;
    this.district = data.district || null;
    this.neonSign = data.neonSign || null;
  }
}
