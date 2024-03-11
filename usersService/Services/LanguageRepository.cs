using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using usersService.Data;
using usersService.Enums;
using usersService.Models;

namespace usersService.Services
{
    public class LanguageRepository
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public LanguageRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        public async Task<LanguageModel> FindLanguage(string languageValue)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var language = await _context.Languages.FirstOrDefaultAsync(l => l.Language == languageValue);
                return language;
            }

        }

        public async Task<LanguageModel> CreateLanguage(string languageValue)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<AppDBContext>();

                var existingLanguage = await FindLanguage(languageValue);

                if (existingLanguage == null)
                {
                    var language = new LanguageModel
                    {
                        LanguageId = Guid.NewGuid().ToString(),
                        Language = languageValue
                    };
                    _context.Languages.Add(language);
                    await _context.SaveChangesAsync();
                    return language;
                }
                else
                {
                    return existingLanguage;
                }
            }
        }

    }
}