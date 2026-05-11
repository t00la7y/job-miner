"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobsController_1 = require("../controllers/jobsController");
const router = express_1.default.Router();
router.get('/', jobsController_1.getJobs);
router.post('/save', jobsController_1.saveJob);
exports.default = router;
//# sourceMappingURL=jobs.js.map