
import path from 'path';
import match from 'multimatch';
import svg2sprite from 'svg2sprite';
import type { Plugin } from 'metalsmith';

interface Options {
    pattern: string;
    keepFiles: boolean;
    fileName: string;
    inline: boolean;
    iconPrefix: string;
    clean: Partial<CleanOptions>;
}

interface CleanOptions {
    stripStyles: boolean;
    stripEmptyTags: boolean;
    stripExtraAttrs: boolean;
    stripAttrs: string[];
}

export = function main(opts: Partial<Options>): Plugin {
    const options: Options = {
        pattern: "**/*.svg",
        keepFiles: false,
        fileName: 'sprites.svg',
        inline: true,
        iconPrefix: "icon-",
        clean: {
            stripStyles: true,
            stripEmptyTags: true,
            stripExtraAttrs: true,
            stripAttrs: ["width", "height"],
            ...opts.clean,
        },
        ...opts,
    };
    
    return async function sprites(files, metalsmith, done) {
        try {
            const { pattern, keepFiles, fileName, ...config} = options;
            
            // Filter icon files for processing.
            const validFiles = match(Object.keys(files), pattern);
            
            if (validFiles.length === 0) {
                throw new Error(`Pattern '${pattern}' did not match any files.`);
            }
            
            const collection = svg2sprite.collection(config);
            
            for (let filename of validFiles) {
                const { name } = path.parse(filename);
                
                const body = files[filename].contents.toString("utf-8");
                collection.add(normalise(name), body);
                
                if (!keepFiles) {
                    delete files[filename];
                }
            }
            
            const spriteSvg = collection.compile();
            
            if (config.inline) {
                // @ts-ignore : hack this in there.
                metalsmith._metadata['sprites'] = spriteSvg;
            }
            else {
                // Otherwise
                files[fileName] = spriteSvg;
            }
            
            done(null, files, metalsmith);
        }
        catch (error) {
            done(error, files, metalsmith);
        }
    }
}

/**
 * Create an ID safe string from anything.
 */
function normalise(text: string): string {
    return text.replace(/[\s_-]+/, '-')
        .replace(/(^-+|-+$)/, '')
        .toLowerCase();
}
