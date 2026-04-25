using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sweetVenomServer.Data;
using sweetVenomServer.Models;


[Route("api/[controller]")]
[ApiController]
public class CakesController : ControllerBase
{
    private readonly CakeShopContext _context;

    public CakesController(CakeShopContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cake>>> GetAll()
    {
        return await _context.Cakes.Include(c => c.Category).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Cake>> GetById(int id)
    {
        var cake = await _context.Cakes.Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (cake == null) return NotFound();
        return cake;
    }

    [HttpPost]
    public async Task<ActionResult<Cake>> Create(Cake cake)
    {
        _context.Cakes.Add(cake);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { cake.Id }, cake);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Cake cake)
    {
        if (id != cake.Id)
        {
            return BadRequest();
        }

        _context.Entry(cake).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cake = await _context.Cakes.FindAsync(id);
        if(cake == null) return NotFound();
        _context.Cakes.Remove(cake);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
