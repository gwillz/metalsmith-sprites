
const test = require('tape');
const path = require('path');
const fs = require('fs');
const Metalsmith = require('metalsmith');
const sprites = require('./dist/index');

test("Execute example project (inline - default)", assert => {
    const M = create();
    
    // call our plugin
    M.use(sprites({
        pattern: "icons/*.svg",
    }))
    // asserts performed in async
    .build((err, files) => {
        if (err) assert.fail(err);
        
        const metadata = M.metadata();
        assert.ok(metadata['sprites'], 'metadata [sprites]')
        
        const actual = metadata['sprites'];
        const expected = fs.readFileSync('./test/expected.svg', 'utf-8');
        
        // verify
        assert.equal(actual, expected, 'output matches [expected.svg]');
        assert.end();
    })
})

test("Execute example project (export file)", assert => {
    const M = create();
    
    // call our plugin
    M.use(sprites({
        pattern: "icons/*.svg",
    }))
    // asserts performed in async
    .build((err, files) => {
        if (err) assert.fail(err);
        
        assert.ok(files['sprites.svg'], 'builds [sprites.svg]')
        
        const actual = files['index.css'].contents.toString();
        const expected = fs.readFileSync('./test/expected.svg', 'utf-8');
        
        // verify
        assert.equal(actual, expected, 'output matches [expected.svg]');
        assert.end();
    })
})

test("normalise()", assert => {
    const actual = sprites.normalise("-_oh-nooo it's a total-- mess.  ");
    const expected = "oh-nooo-it-s-a-total-mess";
    
    assert.equals(actual, expected);
    assert.end();
})


// shorthand
function create() {
    return new Metalsmith(path.resolve(__dirname, 'test/'))
    .clean(true)
    .source('src')
    .destination('dest')
}
