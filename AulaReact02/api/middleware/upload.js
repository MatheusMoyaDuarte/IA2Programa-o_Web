const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const pasta = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(pasta, { recursive: true });

const extensoes = ['.jpg', '.jpeg', '.png'];
const tipos = ['image/jpeg', 'image/png'];

const upload = multer({
    storage: multer.diskStorage({
        destination: pasta,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!tipos.includes(file.mimetype) || !extensoes.includes(ext)) {
            const err = new Error('TIPO_INVALIDO');
            err.code = 'TIPO_INVALIDO';
            return cb(err);
        }
        cb(null, true);
    }
});

// confere os primeiros bytes do arquivo, já que o mimetype vem do cliente
function assinaturaValida(caminho) {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(caminho, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);
    const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const png = buffer.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    return jpeg || png;
}

function removerArquivo(nome) {
    if (!nome) return;
    fs.unlink(path.join(pasta, path.basename(nome)), () => {});
}

function uploadImagem(req, res, next) {
    upload.single('imagem')(req, res, (err) => {
        if (err) {
            if (err.code === 'TIPO_INVALIDO') {
                return res.status(422).json({ message: 'A imagem deve ser .jpeg ou .png' });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(422).json({ message: 'A imagem deve ter no máximo 5MB' });
            }
            return next(err);
        }
        if (req.file && !assinaturaValida(req.file.path)) {
            removerArquivo(req.file.filename);
            return res.status(422).json({ message: 'A imagem deve ser .jpeg ou .png' });
        }
        next();
    });
}

module.exports = { uploadImagem, removerArquivo };
